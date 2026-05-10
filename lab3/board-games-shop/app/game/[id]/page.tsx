import { BoardGame } from "@/types";
import Link from "next/link";

async function getBoardGames(): Promise<BoardGame[]> {
  const res = await fetch("https://szandala.github.io/piwo-api/board-games.json");
  if (!res.ok) throw new Error("Nie udało się pobrać danych");
  const data = await res.json();
  return data.board_games;
}

interface Props {
  params: Promise<{id: string;}>;
}

export default async function GameDetails({ params }: Props) {
  const {id} = await params; 
  const games = await getBoardGames();
  const game = games.find((game) => game.id.toString() === id);

  if (!game) {
    return (
      <main className="p-8 bg-gray-900 min-h-screen text-gray-200 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Nie znaleziono gry</h1>
        <Link href="/" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
          Powrót do sklepu
        </Link>
      </main>
    );
  }

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-gray-200">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">{game.title}</h1>
          <Link href="/" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
            Wróć
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900 border border-gray-700 h-64 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Miejsce na zdjęcia</span>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-2xl font-bold text-white">{game.price_pln} PLN</p>
            <p className="text-gray-400"><strong>Wydawca:</strong> {game.publisher}</p>
            <p className="text-gray-400"><strong>Liczba graczy:</strong> {game.min_players} - {game.max_players}</p>
            <p className="text-gray-400"><strong>Czas gry:</strong> ok. {game.avg_play_time_minutes} min</p>

            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Opis gry</h2>
              <div className="text-gray-300 flex flex-col gap-2">
                {game.description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <button className="mt-auto py-3 bg-gray-700 hover:bg-gray-600 font-bold rounded-md transition-colors">
              Do koszyka
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}