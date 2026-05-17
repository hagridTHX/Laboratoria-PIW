"use client";

import { useState, useEffect, useReducer, useMemo } from "react";
import Link from "next/link";
import { BoardGame } from "@/types";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";


type FavoriteAction =
  | { type: "INIT"; payload: string[] }
  | { type: "TOGGLE"; payload: string };

const favoritesReducer = (state: string[], action: FavoriteAction): string[] => {
  switch (action.type) {
    case "INIT":
      return action.payload;
    case "TOGGLE":
      const exists = state.includes(action.payload);
      const newState = exists
        ? state.filter((id) => id !== action.payload)
        : [...state, action.payload];
      localStorage.setItem("tabula_favorites", JSON.stringify(newState));
      return newState;
    default:
      return state;
  }
};

export default function GamesList() {
  const [games, setGames] = useState<BoardGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [sortOption, setSortOption] = useState("title_asc");
  const ITEMS_PER_PAGE = 9;

  const [localFilter, setLocalFilter] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, dispatch] = useReducer(favoritesReducer, []);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("tabula_favorites");
    if (storedFavorites) {
      dispatch({ type: "INIT", payload: JSON.parse(storedFavorites) });
    }
  }, []);

  const displayedGames = useMemo(() => {
    let filtered = games;
    if (showFavoritesOnly) {
      filtered = filtered.filter((game) => favorites.includes(game.id.toString()));
    }
    if (localFilter.trim() !== "") {
      const lowerFilter = localFilter.toLowerCase();
      filtered = filtered.filter((game) =>
        game.title.toLowerCase().includes(lowerFilter)
      );
    }
    return filtered;
  }, [games, localFilter, showFavoritesOnly, favorites]);

  const fetchGames = async (action: "init" | "loadMore" | "sortChange" = "init") => {
    if (action === "loadMore") setLoadingMore(true);
    else setLoading(true);

    try {
      let sortField = "title";
      let sortDir: "asc" | "desc" = "asc";

      if (sortOption === "price_asc") { sortField = "price_pln"; sortDir = "asc"; }
      else if (sortOption === "price_desc") { sortField = "price_pln"; sortDir = "desc"; }
      else if (sortOption === "title_desc") { sortField = "title"; sortDir = "desc"; }

      const gamesRef = collection(db, "games");
      let q;

      const currentLimit = action === "sortChange" ? Math.max(games.length, ITEMS_PER_PAGE) : ITEMS_PER_PAGE;

      if (action === "loadMore" && lastDoc) {
        q = query(gamesRef, orderBy(sortField, sortDir), startAfter(lastDoc), limit(currentLimit));
      } else {
        q = query(gamesRef, orderBy(sortField, sortDir), limit(currentLimit));
      }

      const snapshot = await getDocs(q);
      const fetchedGames = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }) as BoardGame);

      if (snapshot.docs.length < currentLimit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);

      if (action === "loadMore") {
        setGames(prev => [...prev, ...fetchedGames]);
      } else {
        setGames(fetchedGames);
      }

    } catch (error) {
      console.error("Błąd pobierania gier z bazy:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchGames("sortChange");
  }, [sortOption]);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <span className="text-slate-300">Wyświetlono: {displayedGames.length} ofert{!showFavoritesOnly && hasMore && " (dostępne kolejne)"}</span>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <label htmlFor="sort" className="text-slate-300 text-sm">Sortuj:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-slate-500"
            >
              <option value="title_asc">Tytuł: A-Z</option>
              <option value="title_desc">Tytuł: Z-A</option>
              <option value="price_asc">Cena: Od najtańszych</option>
              <option value="price_desc">Cena: Od najdroższych</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            placeholder="Wyszukaj w pobranych ofertach..."
            value={localFilter}
            onChange={(e) => setLocalFilter(e.target.value)}
            className="w-full md:flex-1 p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-slate-500"
          />
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`w-full md:w-auto px-4 py-2 rounded-md font-bold transition-colors border ${showFavoritesOnly
                ? "bg-slate-200 text-slate-900 border-slate-200"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
          >
            Ulubione ({favorites.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400 animate-pulse">Pobieranie listy ofert...</div>
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedGames.map((game) => {
              const isFavorite = favorites.includes(game.id.toString());
              return (
                <div key={game.id} className="relative bg-slate-800 border border-slate-700 p-4 rounded-lg flex flex-col gap-2 hover:border-slate-500 transition-colors">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch({ type: "TOGGLE", payload: game.id.toString() });
                    }}
                    className={`absolute top-6 right-6 z-10 px-3 py-1 rounded-md text-sm font-bold border transition-colors ${isFavorite ? "bg-slate-200 text-slate-900 border-slate-200" : "bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800"
                      }`}
                  >
                    {isFavorite ? "Zapisane" : "Zapisz"}
                  </button>

                  <Link href={`/game/${game.id}`} className="flex flex-col flex-1 gap-2">
                    {game.images && game.images.length > 0 ? (
                      <img
                        src={game.images[0].startsWith("http") ? game.images[0] : `https://szandala.github.io/piwo-api/${game.images[0]}`}
                        alt={game.title}
                        className="w-full h-48 object-cover rounded-md mb-2"
                      />
                    ) : (
                      <div className="bg-slate-900 w-full h-48 border border-slate-700 rounded-md mb-2 flex items-center justify-center">
                        <span className="text-slate-500 text-sm">Brak zdjęcia</span>
                      </div>
                    )}

                    <h2 className="text-xl font-bold text-slate-100 line-clamp-1 pr-24">{game.title}</h2>
                    <p className="text-slate-400 text-sm mb-2">{game.publisher}</p>

                    {game.auction ? (
                      <p className="font-bold text-lg text-amber-400 mt-auto">
                        Licytacja: {game.auction.current_bid || game.auction.starting_price} PLN
                      </p>
                    ) : (
                      <p className="font-bold text-lg text-slate-100 mt-auto">{game.price_pln} PLN</p>
                    )}
                  </Link>
                </div>
              );
            })}
          </ul>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => fetchGames("loadMore")}
                disabled={loadingMore}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 font-bold rounded-md transition-colors text-slate-100"
              >
                {loadingMore ? "Pobieranie kolejnych ofert..." : "Wczytaj kolejne oferty"}
              </button>
            </div>
          )}
          {!hasMore && !showFavoritesOnly && (
            <p className="text-center text-slate-500 mt-10 text-sm">Brak dalszych ofert.</p>
          )}
        </>
      )}
    </div>
  );
}