import { AiOutlineInfoCircle } from "react-icons/ai";

export default function InfoCard() {
  return (
    <section className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm">
          <div className="flex items-start gap-3">
            <AiOutlineInfoCircle className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Requisitos de upload</h2>
              <ul className="mt-1 text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Tipos aceitos: <span className="font-medium text-gray-800">MP4 (vídeo) e MP3 (áudio)</span></li>
                <li>Tamanho máximo do arquivo: <span className="font-medium text-gray-800">200 MB</span></li>
              </ul>
            </div>
          </div>
        </section>
  );
}
