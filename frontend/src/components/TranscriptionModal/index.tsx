import { AiOutlineCopy, AiOutlineDownload } from "react-icons/ai";
import { useState } from "react";
import { Transcription } from "@/types/Transcription";


interface Props {
  transcription: Transcription | null;
  open: boolean;
  onClose: () => void;
}

export default function TranscriptionModal({ transcription, open, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!open || !transcription) return null;

  const handleCopy = () => {
    if (transcription.transcript) {
      navigator.clipboard.writeText(transcription.transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = () => {
    // if (!transcription.transcript) return;
    // const blob = new Blob([transcription.transcript], { type: "text/plain;charset=utf-8" });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = `${transcription.fileName.replace(/\.[^/.]+$/, "")}.txt`;
    // a.click();
    // URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white text-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-lg cursor-pointer"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4">{transcription.fileName}</h2>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Transcrição:</h3>
          <div className="p-3 border rounded max-h-64 overflow-y-auto bg-gray-50 text-gray-800 whitespace-pre-wrap">
            {transcription.transcript || "--"}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm"
          >
            <AiOutlineCopy /> {copied ? "Copiado!" : "Copiar"}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm"
          >
            <AiOutlineDownload /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
