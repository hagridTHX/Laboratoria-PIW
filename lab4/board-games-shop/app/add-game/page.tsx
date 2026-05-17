"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

export default function AddGame() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("strategy");
  const [description, setDescription] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [publisher, setPublisher] = useState("");

  const [isAuction, setIsAuction] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const router = useRouter();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const focusDescription = () => {
    if (descriptionRef.current) {
      descriptionRef.current.focus();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        setPublisher(currentUser.email);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      alert("Wymagane jest zalogowanie, aby opublikować ofertę.");
      return;
    }

    try {
      const gamesCollection = collection(db, "games");

      const gameData: any = {
        title,
        price_pln: Number(price),
        category,
        description: [description],
        publisher: publisher || "Brak danych",
        min_players: 2,
        max_players: 4,
        images: imageUrl ? [imageUrl] : [],
        owner_uid: user.uid,
        is_sold: false,
        auction: isAuction ? {
          starting_price: Number(price),
          current_bid: 0,
          highest_bidder_uid: ""
        } : null
      };

      await addDoc(gamesCollection, gameData);
      alert(isAuction ? "Oferta aukcyjna została pomyślnie opublikowana." : "Oferta została pomyślnie opublikowana.");
      router.push("/");
    } catch (error) {
      console.error("Błąd podczas dodawania:", error);
      alert("Wystąpił błąd podczas publikowania oferty.");
    }
  };

  if (authLoading) {
    return <main className="p-8 min-h-screen pt-20 text-center text-slate-100">Weryfikacja uprawnień...</main>;
  }

  if (!user) {
    return (
      <main className="p-8 bg-slate-900 min-h-screen text-slate-100 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Publikowanie ofert wymaga zalogowania.</h1>
        <Link href="/login" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-slate-100">
          Przejdź do logowania
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8 bg-slate-900 min-h-screen text-slate-100 flex justify-center items-start pt-12 md:pt-16">
      <section className="bg-slate-800 p-6 md:p-8 rounded-lg w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Nowa oferta</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="title">Tytuł gry:</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100" />
          </div>

          <div className="flex items-center gap-2 mt-2 mb-2 bg-slate-900 p-3 rounded-md border border-slate-700">
            <input
              type="checkbox"
              id="auctionToggle"
              checked={isAuction}
              onChange={(e) => setIsAuction(e.target.checked)}
              className="w-5 h-5 accent-amber-500"
            />
            <label htmlFor="auctionToggle" className="font-bold text-amber-400 cursor-pointer">
              Wystaw jako licytację
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="price">{isAuction ? "Cena wywoławcza (zł):" : "Cena (zł):"}</label>
            <input type="number" id="price" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="publisher">Wydawca / Sprzedawca:</label>
            <input type="text" id="publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} required className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="imageUrl">Link do zdjęcia (URL, opcjonalnie):</label>
            <input type="url" id="imageUrl" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="category">Kategoria:</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100">
              <option value="strategy">Strategiczna</option>
              <option value="family">Rodzinna</option>
              <option value="party">Imprezowa</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-2 items-start md:flex-row md:justify-between md:items-end">
              <label htmlFor="description">Opis gry:</label>
              <button type="button" onClick={focusDescription} className="text-xs text-blue-400 hover:text-blue-300">
                Aktywuj pole opisu
              </button>
            </div>
            <textarea id="description" ref={descriptionRef} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100"></textarea>
          </div>

          <button type="submit" className={`mt-4 p-3 font-bold rounded-md transition-colors text-slate-100 ${isAuction ? "bg-amber-600 hover:bg-amber-500" : "bg-slate-800 hover:bg-slate-700"}`}>
            {isAuction ? "Opublikuj licytację" : "Opublikuj ofertę"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-slate-400 hover:text-slate-100 transition-colors">Powrót do sklepu</Link>
        </div>
      </section>
    </main>
  );
}