"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="bg-slate-900 p-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center text-slate-200 border-b border-slate-800">
      <Link href="/" className="text-xl font-bold hover:text-slate-100 transition-colors">
        Tabula Ludum
      </Link>
      
      <div className="flex flex-col gap-3 items-start md:flex-row md:gap-6 md:items-center">
        <Link href="/add-game" className="text-slate-300 hover:text-slate-100 transition-colors">
          Dodaj grę
        </Link>
        
        {user ? (
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
            <span className="text-sm text-slate-400 hidden md:block">
              {user.email}
            </span>
            <button 
              onClick={() => signOut(auth)} 
              className="bg-rose-700 hover:bg-rose-600 text-rose-100 px-4 py-2 rounded-md transition-colors"
            >
              Wyloguj
            </button>
          </div>
        ) : (
          <Link href="/login" className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-md transition-colors font-bold text-slate-100">
            Zaloguj się
          </Link>
        )}
      </div>
    </nav>
  );
}