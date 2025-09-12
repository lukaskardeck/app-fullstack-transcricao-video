import { Request, Response } from "express";
import { db } from "../config/firebase";

export async function createTranscriptionRequest(req: Request, res: Response) {
  const user = (req as any).user; // adicionado pelo verifyToken
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Arquivo não enviado" });
  }

  try {
    // Criar documento no Firestore
    const docRef = await db.collection("transcriptions").add({
      userId: user.uid,
      fileName: file.originalname,
      storedName: file.filename,
      sizeBytes: file.size,
      videoPath: file.path,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(202).json({
      id: docRef.id,
      message: `Arquivo recebido para usuário ${user.uid}`,
      file: {
        originalName: file.originalname,
        storedName: file.filename,
        size: file.size,
        path: file.path,
      },
    });
  } catch (err: any) {
    console.error("Erro ao criar doc Firestore:", err);
    return res.status(500).json({ error: "Erro interno ao salvar transcrição" });
  }
}


// Listar transcrições do usuário autenticado
export const listTranscriptions = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid; // injetado pelo authMiddleware

    const snapshot = await db
      .collection("transcriptions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const transcriptions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(transcriptions);
  } catch (error) {
    console.error("Erro ao listar transcrições:", error);
    return res.status(500).json({ error: "Erro ao buscar transcrições" });
  }
};

