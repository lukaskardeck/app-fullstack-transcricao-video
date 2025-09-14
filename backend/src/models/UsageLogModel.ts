import { db } from "../config/firebase";

export enum UsageStatus {
  PENDING = "pending",
  DONE = "done",
  ERROR = "error",
}

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

// Cria log de uso
export const createUsageLog = async (data: {
  userId: string;
  transcriptionId: string;
  duration: number; // segundos
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

// Atualiza status de log
export const updateUsageLogStatus = async (id: string, status: UsageStatus): Promise<void> => {
  await collectionRef.doc(id).update({ status });
};

// Soma uso diário (em segundos)
export const getDailyUsageSeconds = async (userId: string): Promise<number> => {
  const today = new Date().toISOString().split("T")[0];

  const snapshot = await collectionRef
    .where("userId", "==", userId)
    .where("date", "==", today)
    .where("status", "==", UsageStatus.DONE)
    .get();

  return snapshot.docs.reduce((sum, doc) => {
    const data = doc.data() as UsageLog;
    return sum + (data.duration || 0);
  }, 0);
};

// Soma uso diário (em minutos, arredondado para baixo)
export const getDailyUsageMinutes = async (userId: string): Promise<number> => {
  const totalSeconds = await getDailyUsageSeconds(userId);
  return Math.floor(totalSeconds / 60);
};

// Verifica se usuário tem cota disponível
export const hasQuotaAvailable = async (userId: string, newDurationSec: number, dailyLimitMinutes: number): Promise<boolean> => {
  const usedTodaySec = await getDailyUsageSeconds(userId);
  const limitSec = dailyLimitMinutes * 60;
  return usedTodaySec + newDurationSec <= limitSec;
};
