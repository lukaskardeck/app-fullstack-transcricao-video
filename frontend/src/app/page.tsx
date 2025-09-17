"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import TranscriptionModal from "@/components/TranscriptionModal";
import { Transcription } from "@/types/Transcription";
import Header from "@/components/Header";
import FilterBar, { Filter } from "@/components/FilterBar";
import TranscriptionTable from "@/components/TranscriptionTable";
import UploadArea from "@/components/UploadArea";
import WelcomeSection from "@/components/WelcomeSection";
import { useQuota } from "@/hooks/useQuota";
import { useTranscriptions } from "@/hooks/useTranscriptions";
import { withAuth } from "@/components/WithAuth";
import { auth } from "../../lib/firebase";
import InfoCard from "@/components/InfoCard";
import ConfirmUploadModal from "@/components/ConfirmUploadModal";
import { formatDuration, getFileDuration } from "@/utils/format";

function HomePage() {
  const user = auth.currentUser!;

  const [filter, setFilter] = useState<Filter>("all");
  const [transcriptionModalOpen, setTranscriptionModalOpen] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { quota, fetchQuota } = useQuota(user);
  const {
    transcriptions,
    loading: transcriptionsLoading,
    error,
    uploading,
    handleUpload: baseHandleUpload,
    handleDelete: baseHandleDelete
  } = useTranscriptions(user, false, fetchQuota);

  useEffect(() => {
    fetchQuota();
  }, []);

  const handleUpload = async (file: File) => {
    if (quota.used >= quota.limit) {
      toast.error("Você atingiu o limite diário de minutos transcritos.");
      return;
    }

    await baseHandleUpload(file);
    await fetchQuota();
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleFileSelected = async (file: File) => {
    // Validações
    if (file.size > 200 * 1024 * 1024) {
      setErrorMessage("O arquivo excede o limite de 200 MB.");
      setPendingFile(null);
      setConfirmOpen(true);
      return;
    }

    if (!["video/mp4", "audio/mpeg"].includes(file.type)) {
      setErrorMessage("Formato inválido. Apenas arquivos MP4 ou MP3 são aceitos.");
      setPendingFile(null);
      setConfirmOpen(true);
      return;
    }

    // Validação de duração
    try {
      const durationSeconds = await getFileDuration(file); // duração em segundos

      if (durationSeconds > quota.remainingSeconds) {
        setErrorMessage(
          `O arquivo excede a cota restante do usuário (${formatDuration(quota.remainingSeconds)})`
        );
        setPendingFile(null);
        setConfirmOpen(true);
        return;
      }
    } catch (err) {
      setErrorMessage("Não foi possível determinar a duração do arquivo.");
      setPendingFile(null);
      setConfirmOpen(true);
      return;
    }

    // Se passou nas validações
    setErrorMessage(null);
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;
    setConfirmOpen(false);
    await handleUpload(pendingFile);
    setPendingFile(null);
  };

  const openTranscriptionModal = (transcription: Transcription) => {
    setSelectedTranscription(transcription);
    setTranscriptionModalOpen(true);
  };

  const filteredTranscriptions =
    filter === "all"
      ? transcriptions
      : transcriptions.filter(t => t.status === filter);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Toaster position="bottom-right" />

      <Header
        quota={quota}
        userEmail={user.email}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl mx-auto p-6 w-full">
        <WelcomeSection />

        <div className="mb-6">
          <InfoCard />
          <UploadArea uploading={uploading} onUpload={handleFileSelected} />
        </div>

        <FilterBar filter={filter} setFilter={setFilter} />

        <TranscriptionsContent
          loading={transcriptionsLoading}
          error={error}
          transcriptions={filteredTranscriptions}
          onOpen={openTranscriptionModal}
          onDelete={baseHandleDelete}
          filter={filter}
        />

        <TranscriptionModal
          transcription={selectedTranscription}
          open={transcriptionModalOpen}
          onClose={() => setTranscriptionModalOpen(false)}
        />

        <ConfirmUploadModal
          open={confirmOpen}
          file={pendingFile}
          quotaRemaining={quota.remaining}
          errorMessage={errorMessage}
          onConfirm={confirmUpload}
          onCancel={() => {
            setConfirmOpen(false);
            setPendingFile(null);
            setErrorMessage(null);
          }}
        />
      </main>
    </div>
  );
}

// Lista de transcrições
interface TranscriptionsContentProps {
  loading: boolean;
  error: string | null;
  transcriptions: Transcription[];
  onOpen: (transcription: Transcription) => void;
  onDelete: (id: string) => void;
  filter: Filter;
}

function TranscriptionsContent({
  loading,
  error,
  transcriptions,
  onOpen,
  onDelete,
  filter
}: TranscriptionsContentProps) {
  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;

  if (transcriptions.length === 0) {
    if (filter === "all") {
      return <p>Você ainda não fez nenhuma transcrição.</p>;
    } else {
      return <p>Não há transcrições com o status de "{filter === "pending" ? "Em processamento" : filter === "done" ? "Concluídas" : "Erros"}".</p>;
    }
  }

  return (
    <TranscriptionTable
      transcriptions={transcriptions}
      onOpen={onOpen}
      onDelete={onDelete}
    />
  );
}

export default withAuth(HomePage);
