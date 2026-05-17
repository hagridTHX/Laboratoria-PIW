import GamesList from "@/components/GamesList";

export default function Home() {
  return (
    <main className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-100">Katalog gier planszowych</h1>
      <GamesList />
    </main>
  );
}