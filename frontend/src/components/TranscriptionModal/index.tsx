import { AiOutlineCopy, AiOutlineDownload, AiOutlineEdit, AiOutlineSave } from "react-icons/ai";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Transcription } from "@/types/Transcription";
import { auth } from "../../../lib/firebase";

interface Props {
  transcription: Transcription | null;
  open: boolean;
  onClose: () => void;
}

export default function TranscriptionModal({ transcription, open, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [saving, setSaving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (transcription?.transcript) {
      setEditedText(transcription.transcript);
    }

    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();

      // mover cursor para o final do texto
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [transcription, isEditing]);

  if (!open || !transcription) return null;

  const handleCopy = () => {
    if (transcription.transcript) {
      navigator.clipboard.writeText(transcription.transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = async () => {
    //
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");

      const token = await user.getIdToken();

      const res = await fetch(`http://localhost:8080/api/transcription/${transcription.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transcript: editedText }),
      });

      if (!res.ok) throw new Error("Erro ao salvar edição");

      setIsEditing(false);
      transcription.transcript = editedText; // atualização otimista
      toast.success("Edição salva com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Não foi possível salvar a edição.");
      toast.error("Não foi possível salvar a edição.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-100 text-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
        <button
          onClick={() => {
            setIsEditing(false);
            setEditedText(transcription.transcript || "");
            onClose();
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-lg cursor-pointer"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4">{transcription.fileName}</h2>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Transcrição:</h3>

          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-3 border rounded h-72 overflow-y-auto bg-gray-50 text-gray-800 whitespace-pre-wrap resize-none"
            />
          ) : (
            <div className="w-full p-3 border rounded h-72 overflow-y-auto bg-gray-50 text-gray-800 whitespace-pre-wrap resize-none">
              {transcription.transcript || "--"}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {!isEditing && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm cursor-pointer"
              >
                <AiOutlineCopy /> {copied ? "Copiado!" : "Copiar"}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm cursor-pointer"
              >
                <AiOutlineDownload /> Download
              </button>
            </>
          )}


          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm cursor-pointer"
                disabled={saving}
              >
                <AiOutlineSave /> {saving ? "Salvando..." : "Salvar"}
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(transcription.transcript || ""); // restaura original
                }}
                className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm cursor-pointer"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm cursor-pointer"
            >
              <AiOutlineEdit /> Editar
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
