"use client";

import { useEffect, useState } from "react";
import { BoardGame } from "@/types";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, runTransaction } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

export default function GameDetails() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [game, setGame] = useState<BoardGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("strategy");
  const [editDescription, setEditDescription] = useState("");

  const [bidValue, setBidValue] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const fetchGame = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "games", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGame({ id: docSnap.id, ...(docSnap.data() as any) } as BoardGame);
        }
      } catch (error) {
        console.error("Błąd pobierania gry:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
    return () => unsubscribe();
  }, [id]);

  const handleBuyNow = async () => {
    if (!user) {
      alert("Aby dokonać zakupu, zaloguj się.");
      router.push("/login");
      return;
    }
    try {
      const docRef = doc(db, "games", id);
      await updateDoc(docRef, { is_sold: true });
      setGame((prev) => prev ? { ...prev, is_sold: true } : null);
      alert("Zakup został zakończony pomyślnie.");
    } catch (error) {
      console.error("Błąd zakupu:", error);
      alert("Nie udało się przetworzyć transakcji.");
    }
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Aby wziąć udział w licytacji, zaloguj się.");
      router.push("/login");
      return;
    }

    const numericBid = Number(bidValue);
    if (numericBid <= 0) return;

    try {
      const gameRef = doc(db, "games", id);

      await runTransaction(db, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists()) {
          throw new Error("Oferta nie istnieje.");
        }

        const data = gameDoc.data();
        const currentBid = data.auction?.current_bid || data.auction?.starting_price || 0;

        if (numericBid <= currentBid) {
          throw new Error(`Oferta musi być wyższa niż obecna cena (${currentBid} PLN).`);
        }

        transaction.update(gameRef, {
          "auction.current_bid": numericBid,
          "auction.highest_bidder_uid": user.uid
        });
      });

      setGame((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          auction: {
            ...prev.auction!,
            current_bid: numericBid,
            highest_bidder_uid: user.uid
          }
        };
      });

      setBidValue("");
      alert("Oferta została złożona pomyślnie.");

    } catch (error: any) {
      console.error("Błąd licytacji:", error);
      alert(error.message || "Wystąpił błąd podczas licytacji.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę ofertę na stałe?")) return;
    try {
      await deleteDoc(doc(db, "games", id));
      alert("Oferta została pomyślnie usunięta.");
      router.push("/");
    } catch (error) {
      console.error("Błąd usuwania:", error);
      alert("Nie udało się usunąć oferty.");
    }
  };

  const startEditing = () => {
    if (!game) return;
    setEditTitle(game.title);
    setEditPrice(game.price_pln.toString());
    setEditCategory(game.type || "strategy");
    setEditDescription(game.description?.join("\n") || "");
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(editPrice) < 0) {
      alert("Cena nie może być ujemna.");
      return;
    }
    try {
      const docRef = doc(db, "games", id);
      const updatedData = {
        title: editTitle,
        price_pln: Number(editPrice),
        category: editCategory,
        description: [editDescription],
      };
      await updateDoc(docRef, updatedData);
      setGame((prev) => prev ? { ...prev, ...updatedData } : null);
      setIsEditing(false);
      alert("Oferta została zaktualizowana.");
    } catch (error) {
      console.error("Błąd edycji:", error);
      alert("Nie udało się zapisać zmian.");
    }
  };

  if (loading) {
    return <main className="p-8 text-center text-slate-100 min-h-screen pt-20"><h2 className="text-2xl animate-pulse">Ładowanie szczegółów oferty...</h2></main>;
  }

  if (!game) {
    return (
      <main className="p-8 bg-slate-900 min-h-screen text-slate-100 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Nie znaleziono oferty</h1>
        <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-slate-100">Wróć do sklepu</Link>
      </main>
    );
  }

  if (isEditing) {
    return (
      <main className="p-6 md:p-8 bg-slate-900 min-h-screen text-slate-100 flex justify-center pt-6 md:pt-8">
        <section className="bg-slate-800 p-8 rounded-lg w-full max-w-2xl border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Edytuj ofertę</h2>
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label>Tytuł gry:</label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100" />
            </div>
            <div className="flex flex-col gap-1">
              <label>Cena (zł):</label>
              <input type="number" min="0" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100" />
            </div>
            <div className="flex flex-col gap-1">
              <label>Kategoria:</label>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100">
                <option value="strategy">Strategiczna</option>
                <option value="family">Rodzinna</option>
                <option value="party">Imprezowa</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label>Opis gry:</label>
              <textarea rows={6} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100"></textarea>
            </div>
            <div className="flex gap-4 mt-4">
              <button type="submit" className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-md transition-colors">
                Zapisz zmiany
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 p-3 bg-slate-900 hover:bg-slate-800 font-bold rounded-md transition-colors text-slate-100">
                Anuluj
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8 bg-slate-900 min-h-screen text-slate-100">
      <div className="max-w-4xl mx-auto bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-4xl font-bold">{game.title}</h1>
          <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-slate-100">
            Wróć do sklepu
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {game.images && game.images.length > 0 ? (
            <img
              src={game.images[0].startsWith("http") ? game.images[0] : `https://szandala.github.io/piwo-api/${game.images[0]}`}
              alt={game.title}
              className={`w-full h-80 object-cover rounded-lg border border-slate-700 transition-all ${game.is_sold ? "grayscale opacity-40" : ""}`}
            />
          ) : (
            <div className={`bg-slate-900 border border-slate-700 h-80 rounded-lg flex items-center justify-center ${game.is_sold ? "opacity-40" : ""}`}>
              <span className="text-slate-500">Brak zdjęcia</span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <p className="text-slate-300"><strong>Wydawca:</strong> {game.publisher}</p>
            <p className="text-slate-300"><strong>Liczba graczy:</strong> {game.min_players} - {game.max_players}</p>

            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Opis gry</h2>
              <div className="text-slate-200 flex flex-col gap-2">
                {game.description?.map((paragraph, index) => (
                  <p key={index} className="break-words">{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-slate-700 pt-4">
              {game.auction ? (
                <div className="flex flex-col gap-3">
                  <p className="text-lg text-amber-400 font-bold">
                    Aktualna oferta: {game.auction.current_bid || game.auction.starting_price} PLN
                  </p>

                  {user && game.auction.highest_bidder_uid === user.uid && (
                    <p className="text-sm text-emerald-300 font-bold">Twoja oferta jest najwyższa.</p>
                  )}

                  <form onSubmit={handleBid} className="flex flex-col gap-2 md:flex-row">
                    <input
                      type="number"
                      min={(game.auction.current_bid || game.auction.starting_price) + 0.01}
                      step="0.01"
                      required
                      value={bidValue}
                      onChange={(e) => setBidValue(e.target.value)}
                      placeholder="Wartość oferty"
                      className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded-md text-slate-100"
                    />
                    <button
                      type="submit"
                      className="w-full md:w-auto px-6 bg-amber-600 hover:bg-amber-500 font-bold text-slate-100 rounded-md transition-colors"
                    >
                      Złóż ofertę
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-2xl font-bold text-slate-100">{game.price_pln} PLN</p>
                  <button
                    onClick={handleBuyNow}
                    disabled={game.is_sold}
                    className={`py-3 font-bold rounded-md transition-colors ${game.is_sold
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-100"
                      }`}
                  >
                    {game.is_sold ? "Niedostępna (wyprzedane)" : "Kup teraz"}
                  </button>
                </div>
              )}
            </div>

            {!user && !game.is_sold && !game.auction && (
              <p className="text-xs text-center text-slate-500 mt-2">
                Zaloguj się, aby dokonać zakupu.
              </p>
            )}
            {!user && game.auction && (
              <p className="text-xs text-center text-slate-500 mt-2">
                Zaloguj się, aby złożyć ofertę.
              </p>
            )}

            {user && game.owner_uid === user.uid && (
              <div className="flex flex-col gap-3 md:flex-row md:gap-4 mt-2">
                <button onClick={startEditing} className="w-full md:flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-md transition-colors border border-slate-700">
                  Edytuj ofertę
                </button>
                <button onClick={handleDelete} className="w-full md:flex-1 py-2 bg-rose-700 hover:bg-rose-600 text-rose-100 font-bold rounded-md transition-colors border border-rose-600">
                  Usuń ofertę
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}