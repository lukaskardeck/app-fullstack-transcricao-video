import { db } from "../config/firebase";

export enum TranscriptionStatus {
  PENDING = "pending",
  DONE = "done",
  ERROR = "error",
}

export interface Transcription {
  id: string;
  fileName: string;
  extension: string;
  duration: number;
  transcript?: string;
  status: TranscriptionStatus;
  userId: string;
  createdAt?: Date;
  finishedAt?: Date;
  updatedAt?: Date;
  error?: string;
}

const collectionRef = db.collection("transcriptions");

export const createTranscription = async (data: {
  fileName: string;
  userId: string;
  extension: string;
  duration: number;
}): Promise<Transcription> => {
  const docRef = await collectionRef.add({
    fileName: data.fileName,
    userId: data.userId,
    extension: data.extension,
    duration: data.duration,
    status: TranscriptionStatus.PENDING,
    createdAt: new Date(),
  });

  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() } as Transcription;
};

export const getTranscriptionById = async (id: string): Promise<Transcription | null> => {
  const docRef = collectionRef.doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() } as Transcription;
};

export const updateTranscriptionText = async (id: string, transcript: string): Promise<Transcription | null> => {
  const docRef = collectionRef.doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return null;

  await docRef.update({ transcript, updatedAt: new Date() });

  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as Transcription;
};

export const listTranscriptionsByUser = async (userId: string): Promise<Transcription[]> => {
  const snapshot = await collectionRef
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transcription));
};
