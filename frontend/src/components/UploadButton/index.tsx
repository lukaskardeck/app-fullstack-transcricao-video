import { AiOutlinePlus } from "react-icons/ai";

interface UploadButtonProps {
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadButton({ uploading, onUpload }: UploadButtonProps) {
  return (
    <div className="mb-6">
      <label className="bg-gray-800 text-white px-4 py-2 rounded shadow cursor-pointer hover:bg-gray-900 flex items-center gap-2 w-max">
        <AiOutlinePlus />
        {uploading ? "Enviando..." : "Nova Transcrição"}
        <input
          type="file"
          accept="video/*,audio/mpeg"
          className="hidden"
          onChange={onUpload}
          disabled={uploading}
        />
      </label>
    </div>
  );
}