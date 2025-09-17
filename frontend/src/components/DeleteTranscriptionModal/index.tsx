import { useState } from "react";

type ConfirmModalProps = {
  isOpen: boolean;
  onConfirm: () => Promise<void> | void; // pode ser assíncrono
  onCancel: () => void;
};

export default function DeleteTranscriptionModal({
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(); // espera a ação do pai
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmação</h2>
        <p className="text-gray-600">Deseja realmente excluir esta transcrição?</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            {loading ? "Excluindo...": "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
