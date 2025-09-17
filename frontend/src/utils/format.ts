import { TimestampFirebase } from "@/types/TimestampFirebase";

export const formatFirestoreDate = (ts?: TimestampFirebase) => {
  if (!ts?._seconds) return "--";
  const date = new Date(ts._seconds * 1000 + Math.floor(ts._nanoseconds / 1000000));
  return date.toLocaleString("pt-BR");
};

export async function getFileDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);

    let media: HTMLMediaElement;
    if (file.type.startsWith("audio/")) {
      media = new Audio(url);
    } else if (file.type.startsWith("video/")) {
      media = document.createElement("video");
      media.src = url;
    } else {
      reject("Formato não suportado para duração");
      return;
    }

    media.addEventListener("loadedmetadata", () => {
      resolve(media.duration); // duração em segundos
      URL.revokeObjectURL(url); // libera memória
    });

    media.addEventListener("error", (err) => {
      reject(err);
      URL.revokeObjectURL(url);
    });
  });
}

export const formatDuration = (seconds?: number) => {
  if (seconds == null) return "--";
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};
