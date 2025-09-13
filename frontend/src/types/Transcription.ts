import { TimestampFirebase } from "./TimestampFirebase";

export interface Transcription {
  id: string;
  fileName: string;
  transcript?: string;
  status: string;
  createdAt: TimestampFirebase;
  finishedAt?: TimestampFirebase;
  duration?: number;
}