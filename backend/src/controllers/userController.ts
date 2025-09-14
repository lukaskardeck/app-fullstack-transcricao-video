import { Request, Response } from "express";
import { createUserIfNotExists, getUserById } from "../models/UserModel";
import { getDailyUsageMinutes, getDailyUsageSeconds } from "../models/UsageLogModel";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { email, name } = req.body;

    if (!user?.uid) {
      return res.status(401).json({ error: "Token inválido ou ausente" });
    }

    const createdUser = await createUserIfNotExists(user.uid, email, name);

    return res.status(201).json(createdUser);
  } catch (err: any) {
    console.error("Erro ao registrar usuário:", err);
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

// Função utilitária para formatar segundos no formato mm:ss
const formatSecondsToMMSS = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  // Formatar com zeros à esquerda
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
  
  return `${formattedMinutes}:${formattedSeconds}`;
};

export const getDailyQuota = async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const userData = await getUserById(user.uid);
    if (!userData) return res.status(404).json({ error: "Usuário não encontrado" });

    const usedSeconds = await getDailyUsageSeconds(user.uid);
    const limitSeconds = userData.dailyLimitMinutes * 60; // Converter minutos para segundos
    const remainingSeconds = Math.max(0, limitSeconds - usedSeconds); // Garantir que não seja negativo

    return res.json({
      used: formatSecondsToMMSS(usedSeconds),
      limit: formatSecondsToMMSS(limitSeconds),
      remaining: formatSecondsToMMSS(remainingSeconds),
      plan: userData.plan,
      // Manter valores numéricos para cálculos no frontend se necessário
      usedSeconds: usedSeconds,
      limitSeconds: limitSeconds,
      remainingSeconds: remainingSeconds,
    });
  } catch (err) {
    console.error("Erro ao buscar cota:", err);
    return res.status(500).json({ error: "Erro ao buscar cota" });
  }
};
