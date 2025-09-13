"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { auth } from "../../../../lib/firebase";
import toast, { Toaster } from "react-hot-toast";

interface TranscriptionDetail {
  id: string;
  fileName: string;
  status: string;
  createdAt: string;
  text?: string; // campo opcional (quando concluído)
}

export default function TranscriptionDetailPage() {
  const params = useParams();
  const { id } = params;
  const [transcription, setTranscription] = useState<TranscriptionDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const user = auth.currentUser;
        console.log("Usuário atual:", user);
        if (!user) throw new Error("Usuário não autenticado");

        const token = await user.getIdToken();

        const res = await fetch(
          `http://localhost:8080/api/transcription/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Falha ao buscar transcrição");

        const data = await res.json();
        setTranscription(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscription();
  }, [id]);

  const translateStatus = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "Em processamento", color: "text-yellow-600" };
      case "done":
        return { text: "Concluído", color: "text-green-600" };
      case "error":
        return { text: "Erro", color: "text-red-600" };
      default:
        return { text: status, color: "text-gray-600" };
    }
  };

  const handleDownload = () => {
    if (!transcription?.text) return;
    const blob = new Blob([transcription.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${transcription.fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Transcrição baixada com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="bottom-right" />

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">Erro: {error}</p>}

        {transcription && (
          <>
            <h1 className="text-2xl font-bold mb-2">{transcription.fileName}</h1>
            <p className="text-gray-600 text-sm mb-2">
              Enviado em:{" "}
              {new Date(transcription.createdAt).toLocaleString("pt-BR")}
            </p>
            <p className="mb-4">
              Status:{" "}
              <span className={translateStatus(transcription.status).color}>
                {translateStatus(transcription.status).text}
              </span>
            </p>

            {/* Conteúdo principal */}
            {transcription.status === "done" && transcription.text && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Transcrição</h2>
                <div className="bg-gray-100 p-4 rounded-md mb-4 whitespace-pre-wrap">
                  {transcription.text}
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Baixar Transcrição
                </button>
              </div>
            )}

            {transcription.status === "pending" && (
              <p className="text-yellow-600">
                O vídeo ainda está sendo processado. Volte mais tarde.
              </p>
            )}

            {transcription.status === "error" && (
              <p className="text-red-600">
                Houve um erro ao processar a transcrição. Tente reenviar o
                arquivo.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
