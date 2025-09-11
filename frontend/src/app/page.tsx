"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState("Carregando...");

  useEffect(() => {
    fetch("http://localhost:8080/api/hello")
      .then((res) => res.json())
      .then((data) => setMsg(data.message))
      .catch(() => setMsg("Erro ao conectar com backend"));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Teste Frontend e Backend</h1>
      <p>{msg}</p>
    </main>
  );
}
