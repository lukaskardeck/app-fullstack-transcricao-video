"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import TranscriptionModal from "@/components/TranscriptionModal";
import { Transcription } from "@/types/Transcription";
import Header from "@/components/Header";
import FilterBar, { Filter } from "@/components/FilterBar";
import TranscriptionTable from "@/components/TranscriptionTable";
import UploadButton from "@/components/UploadButton";
import WelcomeSection from "@/components/WelcomeSection";
import { useQuota } from "@/hooks/useQuota";
import { useTranscriptions } from "@/hooks/useTranscriptions";
import { withAuth } from "@/components/WithAuth";
import { auth } from "../../lib/firebase";

function HomePage() {
  const user = auth.currentUser!;
  
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (quota.used >= quota.limit) {
      toast.error("Você atingiu o limite diário de minutos transcritos.");
      e.target.value = "";
      return;
    }
    
    await baseHandleUpload(e);
    await fetchQuota();
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const openModal = (transcription: Transcription) => {
    setSelectedTranscription(transcription);
    setModalOpen(true);
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
        
        <UploadButton 
          uploading={uploading}
          onUpload={handleUpload}
        />

        <FilterBar filter={filter} setFilter={setFilter} />

        <TranscriptionsContent
          loading={transcriptionsLoading}
          error={error}
          transcriptions={filteredTranscriptions}
          onOpen={openModal}
          onDelete={baseHandleDelete}
        />

        <TranscriptionModal
          transcription={selectedTranscription}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
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
}

function TranscriptionsContent({ 
  loading, 
  error, 
  transcriptions, 
  onOpen, 
  onDelete 
}: TranscriptionsContentProps) {
  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;
  
  if (transcriptions.length === 0) {
    return <p>Você ainda não fez nenhuma transcrição.</p>;
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