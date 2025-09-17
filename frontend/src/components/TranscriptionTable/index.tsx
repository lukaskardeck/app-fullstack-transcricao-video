import { Transcription } from "@/types/Transcription";
import { formatDuration, formatFirestoreDate } from "@/utils/format";
import StatusBadge from "../StatusBadge";
import { AiOutlineEye, AiOutlineDelete } from "react-icons/ai";

export default function TranscriptionTable({
  transcriptions,
  onOpen,
  onDelete,
}: {
  transcriptions: Transcription[];
  onOpen: (t: Transcription) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b text-left">Arquivo</th>
            <th className="px-4 py-2 border-b text-left">Duração</th>
            <th className="px-4 py-2 border-b text-left">Upload em</th>
            <th className="px-4 py-2 border-b text-left">Concluído em</th>
            <th className="px-4 py-2 border-b text-left">Status</th>
            <th className="px-4 py-2 border-b text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {transcriptions.map((t) => (
            <tr key={t.id} className="bg-white hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{t.fileName}</td>
              <td className="px-4 py-2 border-b">{formatDuration(t.duration)}</td>
              <td className="px-4 py-2 border-b">{formatFirestoreDate(t.createdAt)}</td>
              <td className="px-4 py-2 border-b">{formatFirestoreDate(t.finishedAt)}</td>
              <td className="px-4 py-2 border-b"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-2 border-b">
                <div className="flex items-center gap-2">
                  {t.status === "done" && (
                    <>
                      <button
                        onClick={() => onOpen(t)}
                        className="text-gray-800 hover:text-gray-600 cursor-pointer"
                        title="Ver transcrição"
                      >
                        <AiOutlineEye size={20} />
                      </button>

                      <button
                        onClick={() => onDelete(t.id)}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        title="Excluir transcrição"
                      >
                        <AiOutlineDelete size={20} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
