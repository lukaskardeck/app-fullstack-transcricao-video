"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import { AiOutlinePlus, AiOutlineEye, AiOutlineDelete } from "react-icons/ai";
import { useRouter } from "next/navigation";
import TranscriptionModal from "@/components/TranscriptionModal";
import { Transcription } from "@/types/Transcription";
import { TimestampFirebase } from "@/types/TimestampFirebase";

type Filter = "all" | "pending" | "done" | "error";

const formatFirestoreDate = (ts?: TimestampFirebase) => {
  // console.log("Timestamp: " + ts?._nanoseconds);
  if (!ts?._seconds) return "--";
  const date = new Date(ts._seconds * 1000 + Math.floor(ts._nanoseconds / 1000000));
  return date.toLocaleString("pt-BR");
};



const formatDuration = (seconds?: number) => {
  // if (seconds == null) return "--";
  // const mins = Math.floor(seconds / 60)
  //   .toString()
  //   .padStart(2, "0");
  // const secs = (seconds % 60).toString().padStart(2, "0");
  // return `${mins}:${secs}`;

  return "--";
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { text: string; bg: string; color: string }> = {
    pending: { text: "Em processamento", bg: "bg-yellow-100", color: "text-yellow-800" },
    done: { text: "Concluído", bg: "bg-green-100", color: "text-green-800" },
    error: { text: "Erro", bg: "bg-red-100", color: "text-red-800" },
  };
  const s = map[status] || { text: status, bg: "bg-gray-200", color: "text-gray-800" };
  return (
    <div className={`${s.bg} ${s.color} w-max px-2 py-1 rounded-full text-sm font-medium`}>
      {s.text}
    </div>
  );
};

export default function HomePage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const [quota] = useState({ used: 3, limit: 5, mb: 120, minutes: 45 });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("Usuário não autenticado.");
        setLoading(false);
        return;
      }
      setUserEmail(user.email);

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
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut(auth);
    setTimeout(() => {
      router.push("/login"); // redireciona após 1s
    }, 1000);
  };

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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Falha ao enviar vídeo");

      const newTranscription = await res.json();
      setTranscriptions((prev) => [newTranscription, ...prev]);
      toast.success("Vídeo enviado com sucesso!");
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta transcrição?")) return;
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");

      const token = await user.getIdToken();
      const res = await fetch(`http://localhost:8080/api/transcription/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Falha ao excluir transcrição");
      setTranscriptions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transcrição excluída!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Função para abrir modal
  const openModal = (t: Transcription) => {
    setSelectedTranscription(t);
    setModalOpen(true);
  };


  const filteredTranscriptions =
    filter === "all"
      ? transcriptions
      : transcriptions.filter((t) => t.status === filter);

  if (loggingOut) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-gray-900 flex-col">
        <p className="text-xl font-bold mb-2">Saindo...</p>
        <p>Você será redirecionado para a tela de login.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Toaster position="bottom-right" />

      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-bold">Transcriber</h1>
        <div className="flex items-center space-x-6">
          {/* Badge de cotas */}
          <div className="relative group cursor-pointer">
            <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
              {quota.used}/{quota.limit} uploads hoje
            </span>
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-4 hidden group-hover:block">
              <p><strong>Uploads:</strong> {quota.used}/{quota.limit}</p>
              <p><strong>MBs usados:</strong> {quota.mb} MB</p>
              <p><strong>Minutos transcritos:</strong> {quota.minutes} min</p>
            </div>
          </div>

          {/* Email + logout */}
          <div className="flex items-center space-x-3">
            <span className="text-sm">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-6xl mx-auto p-6 w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Boas vindas ao Transcriber!</h2>
          <p className="text-gray-600">
            Faça upload de seus vídeos e acompanhe o progresso das suas transcrições.
          </p>
        </div>

        {/* Upload */}
        <div className="mb-6">
          <label className="bg-gray-800 text-white px-4 py-2 rounded shadow cursor-pointer hover:bg-gray-900 flex items-center gap-2 w-max">
            <AiOutlinePlus />
            {uploading ? "Enviando..." : "Nova Transcrição"}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Filtros */}
        <div className="flex space-x-2 mb-4">
          {[
            { key: "all", label: "Todos" },
            { key: "pending", label: "Em processamento" },
            { key: "done", label: "Concluídos" },
            { key: "error", label: "Erros" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as Filter)}
              className={`px-3 py-1 rounded-full text-sm ${filter === f.key
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista em tabela */}
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">Erro: {error}</p>}

        {!loading && !error && (
          <>
            {filteredTranscriptions.length === 0 ? (
              <p>Você ainda não fez nenhuma transcrição.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border-b text-left">Arquivo</th>
                      <th className="px-4 py-2 border-b text-left">Duração</th>
                      <th className="px-4 py-2 border-b text-left">Upload</th>
                      <th className="px-4 py-2 border-b text-left">Concluído</th>
                      <th className="px-4 py-2 border-b text-left">Status</th>
                      <th className="px-4 py-2 border-b text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTranscriptions.map((t) => (
                      <tr key={t.id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">{t.fileName}</td>
                        <td className="px-4 py-2 border-b">{formatDuration(t.duration)}</td>
                        <td className="px-4 py-2 border-b">{formatFirestoreDate(t.createdAt)}</td>
                        <td className="px-4 py-2 border-b">{formatFirestoreDate(t.finishedAt)}</td>

                        <td className="px-4 py-2 border-b">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-4 py-2 border-b gap-2">
                          <div className="flex items-center gap-2">
                            {t.status === "done" && (
                              <button
                                onClick={() => openModal(t)}
                                className="text-gray-800 hover:text-gray-600 cursor-pointer"
                                title="Ver transcrição"
                              >
                                <AiOutlineEye size={20} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                              title="Excluir transcrição"
                            >
                              <AiOutlineDelete size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Modal de transcrição */}
        <TranscriptionModal
          transcription={selectedTranscription}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </main>
    </div>
  );
}
