import { db } from "../config/firebase";

export type UsageStatus = "pending" | "done" | "error";

export interface UsageLog {
  id: string;
  userId: string;
  transcriptionId: string;
  duration: number; // em segundos
  status: UsageStatus;
  date: string; // YYYY-MM-DD
  createdAt: Date;
}

const collectionRef = db.collection("usageLogs");

export const createUsageLog = async (data: {
  userId: string;
  transcriptionId: string;
  duration: number;
  status: UsageStatus;
}): Promise<UsageLog> => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const docRef = await collectionRef.add({
    ...data,
    date: today,
    createdAt: new Date(),
  });

  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() } as UsageLog;
};

export const updateUsageLogStatus = async (id: string, status: UsageStatus): Promise<void> => {
  await collectionRef.doc(id).update({ status });
};

export const getDailyUsageMinutes = async (userId: string): Promise<number> => {
  const today = new Date().toISOString().split("T")[0];

  const snapshot = await collectionRef
    .where("userId", "==", userId)
    .where("date", "==", today)
    .where("status", "==", "done")
    .get();

  const totalSeconds = snapshot.docs.reduce((sum, doc) => {
    const data = doc.data() as UsageLog;
    return sum + (data.duration || 0);
  }, 0);

  return Math.floor(totalSeconds / 60); // retorna minutos
};
