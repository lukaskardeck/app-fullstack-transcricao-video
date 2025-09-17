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

export const createTranscription = async (data: Omit<Transcription, "id" | "status" | "createdAt">): Promise<Transcription> => {
  const docRef = await collectionRef.add({
    ...data,
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

export const markTranscriptionDone = async (
  id: string,
  transcript?: string
): Promise<Transcription | null> => {
  const docRef = collectionRef.doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return null;

  const updateData: any = {
    status: TranscriptionStatus.DONE,
    finishedAt: new Date(),
    updatedAt: new Date(),
  };
  if (transcript) updateData.transcript = transcript;

  await docRef.update(updateData);
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as Transcription;
};

export const markTranscriptionError = async (
  id: string,
  errorMessage: string
): Promise<Transcription | null> => {
  const docRef = collectionRef.doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return null;

  await docRef.update({
    status: TranscriptionStatus.ERROR,
    error: errorMessage,
    updatedAt: new Date(),
  });

  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as Transcription;
};

export const getTranscriptionsByUser = async (userId: string): Promise<Transcription[]> => {
  const snapshot = await collectionRef
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transcription));
};

export async function deleteTranscriptionById(id: string, userId: string) {
  try {
    const docRef = collectionRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    if (data?.userId !== userId) {
      return null; // não pertence ao usuário
    }

    await docRef.delete();
    return { id, ...data };
  } catch (err) {
    console.error("Erro ao deletar transcrição:", err);
    return null;
  }
}
