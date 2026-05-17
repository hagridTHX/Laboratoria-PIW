"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Konto zostało utworzone. Zalogowano.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Zalogowano pomyślnie.");
      }
      router.push("/");
    } catch (error: any) {
      console.error(error);
      alert("Błąd: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("Zalogowano przez Google.");
      router.push("/");
    } catch (error: any) {
      console.error(error);
      alert("Błąd logowania Google: " + error.message);
    }
  };

  return (
    <main className="p-6 md:p-8 bg-slate-900 min-h-screen text-slate-100 flex justify-center items-start pt-12 md:pt-16">
      <section className="bg-slate-800 p-6 md:p-8 rounded-lg w-full max-w-md border border-slate-700 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center">
          {isRegistering ? "Zarejestruj się" : "Zaloguj się"}
        </h2>

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password">Hasło:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:border-slate-500"
            />
          </div>

          <button type="submit" className="mt-2 p-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-md transition-colors text-slate-100">
            {isRegistering ? "Utwórz konto" : "Zaloguj"}
          </button>
        </form>

        <div className="text-center">
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-slate-400 hover:text-slate-100 transition-colors underline"
          >
            {isRegistering ? "Masz już konto? Zaloguj się" : "Nie masz konta? Zarejestruj się"}
          </button>
        </div>

        <hr className="border-slate-700" />

        <button 
          onClick={handleGoogleLogin}
          className="p-3 bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold rounded-md transition-colors flex justify-center items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.36,22 12.2,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
          </svg>
          Zaloguj przez Google
        </button>

        <div className="mt-4 text-center">
          <Link href="/" className="text-slate-400 hover:text-slate-100 transition-colors">
            Powrót do sklepu
          </Link>
        </div>
      </section>
    </main>
  );
}