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

function HomePage() {
  const user = auth.currentUser!;

  const [filter, setFilter] = useState<Filter>("all");
  const [transcriptionModalOpen, setTranscriptionModalOpen] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);

  const { quota, fetchQuota } = useQuota(user);
  const {
    transcriptions,
    loading: transcriptionsLoading,
    error,
    uploading,
    handleUpload: baseHandleUpload,
    handleDelete: baseHandleDelete
  } = useTranscriptions(user, false, fetchQuota); // authLoading sempre false aqui

  // Buscar quota quando componente monta
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

  const openModal = (transcription: Transcription) => {
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
          {/* Instruções do Upload */}
          <InfoCard />

          {/* Botão de Upload */}
          <UploadArea uploading={uploading} onUpload={handleUpload} />
        </div>

        <FilterBar filter={filter} setFilter={setFilter} />

        <TranscriptionsContent
          loading={transcriptionsLoading}
          error={error}
          transcriptions={filteredTranscriptions}
          onOpen={openModal}
          onDelete={baseHandleDelete}
          filter={filter}
        />

        <TranscriptionModal
          transcription={selectedTranscription}
          open={transcriptionModalOpen}
          onClose={() => setTranscriptionModalOpen(false)}
        />
      </main>
    </div>
  );
}

// Componente para o conteúdo das transcrições
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
    if (filter === 'all') {
      return <p>Você ainda não fez nenhuma transcrição.</p>;
    } else {
      return <p>Não há transcrições com o status de "{filter === 'pending' ? 'Em processamento' : filter === 'done' ? 'Concluídas' : 'Erros'}".</p>;
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

// Exporta a HomePage protegida
export default withAuth(HomePage);