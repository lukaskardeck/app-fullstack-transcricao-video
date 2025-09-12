"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Transcription {
  id: string;
  fileName: string;
  status: string;
  createdAt: string;
}

export default function HomePage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();

        const res = await fetch("http://localhost:8080/api/transcription", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Falha ao buscar transcrições");
        }

        const data = await res.json();
        setTranscriptions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Função para upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");

      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch("http://localhost:8080/api/transcription", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Falha ao enviar vídeo");
      }

      const newTranscription = await res.json();

      // Atualiza lista local sem precisar recarregar a página
      setTranscriptions((prev) => [
        {
          id: newTranscription.id,
          fileName: newTranscription.file.originalName,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = ""; // reset input
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="mb-6">
        <label className="bg-blue-600 text-white px-4 py-2 rounded shadow cursor-pointer">
          {uploading ? "Enviando..." : "+ Nova Transcrição"}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <h2 className="text-xl font-semibold mb-4">Minhas Transcrições</h2>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}

      {!loading && !error && (
        <>
          {transcriptions.length === 0 ? (
            <p>Você ainda não fez nenhuma transcrição.</p>
          ) : (
            <ul className="space-y-3">
              {transcriptions.map((t) => (
                <li
                  key={t.id}
                  className="border p-4 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{t.fileName}</p>
                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      <span
                        className={
                          t.status === "done"
                            ? "text-green-600"
                            : t.status === "pending"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }
                      >
                        {t.status}
                      </span>
                    </p>
                  </div>
                  {t.status === "done" && (
                    <a
                      href={`/transcriptions/${t.id}`}
                      className="text-blue-500 underline"
                    >
                      Ver/baixar
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
