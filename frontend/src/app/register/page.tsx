"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setMsg("Insira um e-mail válido");
      return;
    }
    if (password.length < 8) {
      setMsg("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setMsg("As senhas não conferem");
      return;
    }

    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      if (auth.currentUser && name) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      setMsg("✅ Conta criada com sucesso! Redirecionando...");
      setTimeout(() => router.push("/login"), 1500); // redireciona após 1.5s
    } catch (err: any) {
      setMsg("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white shadow-md rounded-xl p-6 w-full max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Cadastro</h1>
      <form onSubmit={handleCadastro} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nome"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <input
          type="password"
          placeholder="Confirmar senha"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2 rounded transition"
        >
          {loading ? "Criando conta..." : "Cadastrar"}
        </button>
      </form>
      {msg && <p className="mt-4 text-center">{msg}</p>}
    </section>
  );
}
