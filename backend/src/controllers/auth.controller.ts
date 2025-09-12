import { Request, Response } from "express";

export const validateToken = (req: Request, res: Response) => {
  res.json({ message: "Token válido", user: (req as any).user });
};