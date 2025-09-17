import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import toast from "react-hot-toast";
import { Transcription } from "@/types/Transcription";

export function useTranscriptions(user: User | null, authLoading: boolean, onTranscriptionUpdate?: () => void) {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Função para polling do status
  const pollTranscriptionStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        if (!user) return;

        const token = await user.getIdToken();
        const res = await fetch(`http://localhost:8080/api/transcription/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Falha ao buscar status");

        const updated = await res.json();

        setTranscriptions((prev) => {
          const prevTranscription = prev.find((t: Transcription) => t.id === updated.id);
          // Se status mudou de "pending" para qualquer outro, atualiza quota
          if (prevTranscription?.status === "pending" && updated.status !== "pending") {
            onTranscriptionUpdate?.();
          }
          return prev.map((t: Transcription) => (t.id === updated.id ? updated : t));
        });

        // Se não está mais "pending", para o polling
        if (updated.status !== "pending") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Erro no polling:", err);
        clearInterval(interval);
      }
    }, 10000);
  };

  // Buscar transcrições iniciais
  useEffect(() => {
    // Se ainda está carregando a autenticação, aguarda
    if (authLoading) {
      return;
    }

    // Se terminou de carregar e não tem usuário, é erro
    if (!user) {
      setError("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    const fetchTranscriptions = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:8080/api/transcription", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Falha ao buscar transcrições");

        const data = await res.json();
        setTranscriptions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscriptions();
  }, [user, authLoading]);

  const handleUpload = async (file: File) => {
    if (!file || !user) return;

    setUploading(true);

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8080/api/transcription", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha ao enviar arquivo");
      }

      const newTranscription = await res.json();
      setTranscriptions((prev) => [newTranscription, ...prev]);
      toast.success("Arquivo enviado com sucesso!");
      pollTranscriptionStatus(newTranscription.id);
    } catch (err: any) {
      // toast.error("Erro: " + err.message);
      setError(err.message); 
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Implementar lógica de delete
    console.log("Delete transcription:", id);
  };

  return {
    transcriptions,
    loading,
    error,
    setError,
    uploading,
    handleUpload,
    handleDelete
  };
}