"use client";

import { useState } from "react";
import Link from "next/link";
import { BoardGame } from "@/types";

interface Props {
  initialGames: BoardGame[];
}

export default function GamesList({ initialGames }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const filteredGames = initialGames.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div>
      <input
        type="text"
        placeholder="Szukaj gry..."
        className="w-full p-3 mb-6 border border-gray-600 bg-gray-900 text-gray-200 rounded-md focus:outline-none focus:border-gray-400"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
      />

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedGames.map((game) => (
          <Link
            href={`/game/${game.id}`}
            key={game.id}
            className="bg-gray-900 border border-gray-700 p-4 rounded-lg flex flex-col gap-2 hover:border-gray-500 transition-colors"
          >
            {game.images.length > 0 ? (
              <img
                src={`https://szandala.github.io/piwo-api/${game.images[0]}`}
                alt={game.title}
                className="w-full h-48 object-cover rounded-md mb-2"
              />
            ) : (
              <img
                src="https://via.placeholder.com/200x200?text=Brak+zdjęcia"
                alt="Brak zdjęcia"
                className="w-full h-48 object-cover rounded-md mb-2 opacity-50"
              />
            )}

            <h2 className="text-xl font-bold text-gray-200">{game.title}</h2>
            <p className="text-gray-400 mb-2">{game.publisher}</p>
            <p className="text-sm italic text-gray-400 mb-4">Graczy: {game.min_players} - {game.max_players}</p>
            <p className="font-bold text-lg text-white mt-auto">{game.price_pln} PLN</p>
          </Link>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-10 text-gray-200">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Poprzednia
          </button>
          
          <span className="font-bold">
            Strona {currentPage} z {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Następna
          </button>
        </div>
      )}
    </div>
  );
}