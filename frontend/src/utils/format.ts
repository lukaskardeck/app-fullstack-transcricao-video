import { TimestampFirebase } from "@/types/TimestampFirebase";

export const formatFirestoreDate = (ts?: TimestampFirebase) => {
  if (!ts?._seconds) return "--";
  const date = new Date(ts._seconds * 1000 + Math.floor(ts._nanoseconds / 1000000));
  return date.toLocaleString("pt-BR");
};

export const formatDuration = (seconds?: number) => {
  if (seconds == null) return "--";
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};
