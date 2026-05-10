import { BoardGame } from "@/types";
import GamesList from "@/components/GamesList";

async function getBoardGames(): Promise<BoardGame[]> {
    const res = await fetch("https://szandala.github.io/piwo-api/board-games.json");
    if (!res.ok) throw new Error("Nie udało się pobrać danych");
    const data = await res.json();
    return data.board_games;
}

export default async function Home() {
    const games = await getBoardGames();

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-6">Sklep z Planszówkami</h1>

            <GamesList initialGames={games} />

        </main>
    );
}