"use client";

import Link from "next/link";
import { useState } from "react";

export default function AddGame() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("strategy");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Gra została dodana");
  };

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-gray-200 flex justify-center items-start pt-16">
      <section className="bg-gray-800 p-8 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Dodaj nową planszówkę</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="title">Tytuł gry:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wpisz tytuł..."
              className="p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-gray-400"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="price">Cena (zł):</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="np. 120"
              className="p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-gray-400"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="category">Kategoria:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-gray-400"
            >
              <option value="strategy">Strategiczna</option>
              <option value="family">Rodzinna</option>
              <option value="party">Imprezowa</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description">Opis gry:</label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Napisz coś o tej grze..."
              className="p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-gray-400"
            ></textarea>
          </div>

          <button type="submit" className="mt-4 p-3 bg-gray-700 hover:bg-gray-600 font-bold rounded-md transition-colors">
            Dodaj do bazy
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            Powrót do sklepu
          </Link>
        </div>
      </section>
    </main>
  );
}