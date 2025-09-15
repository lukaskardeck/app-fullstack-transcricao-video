"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import TranscriptionModal from "@/components/TranscriptionModal";
import { Transcription } from "@/types/Transcription";
import Header from "@/components/Header";
import FilterBar, { Filter } from "@/components/FilterBar";
import TranscriptionTable from "@/components/TranscriptionTable";
import UploadButton from "@/components/UploadButton";
import WelcomeSection from "@/components/WelcomeSection";
import LoadingScreen from "@/components/LoadingScreen";

// Hooks customizados
import { useQuota } from "@/hooks/useQuota";
import { useTranscriptions } from "@/hooks/useTranscriptions";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);

  // Hooks customizados
  const { user, loading: authLoading, loggingOut, handleLogout } = useAuth(router);
  const { quota, fetchQuota } = useQuota(user);
  const { 
    transcriptions, 
    loading: transcriptionsLoading, 
    error, 
    uploading,
    handleUpload: baseHandleUpload,
    handleDelete: baseHandleDelete 
  } = useTranscriptions(user, authLoading, fetchQuota);

  // Buscar quota quando usuário estiver disponível
  useEffect(() => {
    if (user && !authLoading) {
      fetchQuota();
    }
  }, [user, authLoading]);

  // Wrapper para handleUpload que verifica quota
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (quota.used >= quota.limit) {
      toast.error("Você atingiu o limite diário de minutos transcritos.");
      e.target.value = "";
      return;
    }
    
    await baseHandleUpload(e);
    await fetchQuota(); // Atualiza quota após upload
  };

  const openModal = (transcription: Transcription) => {
    setSelectedTranscription(transcription);
    setModalOpen(true);
  };

  const filteredTranscriptions = 
    filter === "all" 
      ? transcriptions 
      : transcriptions.filter(t => t.status === filter);

  if (loggingOut) {
    return <LoadingScreen message="Saindo..." subMessage="Você será redirecionado para a tela de login." />;
  }

  if (authLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Toaster position="bottom-right" />
      
      <Header 
        quota={quota} 
        userEmail={user?.email || null} 
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