import { getDailyUsageMinutes } from "../models/UsageLogModel";
import { getUserById } from "../models/UserModel";

export const checkDailyQuota = async (userId: string, durationSeconds: number): Promise<boolean> => {
  const user = await getUserById(userId);
  if (!user) throw new Error("Usuário não encontrado");

  const usedMinutes = await getDailyUsageMinutes(userId);
  const durationMinutes = Math.ceil(durationSeconds / 60);

  return usedMinutes + durationMinutes <= user.dailyLimitMinutes;
};
