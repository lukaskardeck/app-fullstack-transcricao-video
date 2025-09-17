import { useCallback, useState } from "react";
import { AiOutlineUpload } from "react-icons/ai";

interface UploadAreaProps {
  uploading: boolean;
  onUpload: (file: File) => void;
}

export default function UploadArea({ uploading, onUpload }: UploadAreaProps) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (files: FileList | null) => {
      if (files && files[0]) {
        onUpload(files[0]);
      }
    },
    [onUpload]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer 
        ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files);
      }}
    >
      <label className="flex flex-col items-center gap-2 cursor-pointer">
        <AiOutlineUpload className="w-8 h-8 text-blue-600" />
        <span className="text-sm font-bold text-gray-700">
          {uploading ? "Enviando..." : "Arraste um arquivo ou clique para selecionar"}
        </span>
        <input
          type="file"
          accept="video/mp4,audio/mpeg"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
