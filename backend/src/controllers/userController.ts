import { Request, Response } from "express";
import { createUserIfNotExists } from "../models/User";

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

