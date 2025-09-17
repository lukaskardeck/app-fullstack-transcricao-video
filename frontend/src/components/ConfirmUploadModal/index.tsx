import { AiOutlineExclamationCircle } from "react-icons/ai";

interface ConfirmUploadModalProps {
  open: boolean;
  file: File | null;
  quotaRemaining: number;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmUploadModal({
  open,
  file,
  quotaRemaining,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmUploadModalProps) {

  if (!open) return null;

  const sizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-xl w-full">
        <div className={`flex items-center gap-2  mb-4 ${errorMessage ? "text-red-600" : "text-yellow-600"}`}>
          <AiOutlineExclamationCircle className="w-6 h-6" />
          <h2 className="text-lg font-semibold">
            {errorMessage ? "Erro no envio" : "Confirmar envio"}
          </h2>
        </div>

        {errorMessage ? (
          <p>{errorMessage}</p>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-3">
              Você está prestes a enviar o arquivo abaixo para transcrição.
              Esse processo consumirá sua cota e não poderá ser cancelado.
            </p>

            <ul className="text-sm text-gray-600 mb-4">
              <li><strong>Nome:</strong> {file?.name}</li>
              <li><strong>Tamanho:</strong> {sizeMB} MB</li>
              <li><strong>Tipo:</strong> {file?.type}</li>
              <li><strong>Cota restante:</strong> {quotaRemaining} min</li>
            </ul>
          </>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
          >
            Fechar
          </button>

          {!errorMessage && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white cursor-pointer"
            >
              Confirmar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
