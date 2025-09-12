"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // validações simples
    if (!email.includes("@")) {
      setMsg("Insira um e-mail válido");
      return;
    }
    if (password.length < 8) {
      setMsg("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      setMsg(`Logado como ${userCred.user.email}`);
      // console.log("Token:", token);
    } catch (err: any) {
      setMsg("Erro: " + err.message);
    }
  };

  return (
    <section className="bg-white shadow-md rounded-xl p-6 w-full max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="E-mail"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition">
          Entrar
        </button>
      </form>
      {msg && <p className="mt-4 text-center">{msg}</p>}
    </section>
  );
}
