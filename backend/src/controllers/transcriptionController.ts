import { Request, Response } from "express";
import { db } from "../config/firebase";
import { convertVideoToAudio } from "../services/ffmpegService";
import { transcribeAudio } from "../services/openaiService";
import fs from "fs";
import { TranscriptionStatus } from "../enum/TranscriptionStatus";


// Solicitação de transcrição de vídeo
export async function createTranscriptionRequest(req: Request, res: Response) {
  const user = (req as any).user;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Arquivo não enviado" });
  }

  // cria registro inicial
  const docRef = await db.collection("transcriptions").add({
    userId: user.uid,
    fileName: file.originalname,
    status: TranscriptionStatus.PENDING,
    createdAt: new Date(),
  });

  // resposta imediata ao cliente
  res.status(202).json({
    id: docRef.id,
    fileName: file.originalname,
    status: TranscriptionStatus.PENDING,
    createdAt: new Date().toISOString(),
  });

  // processamento assíncrono
  try {
    const audioPath = await convertVideoToAudio(file.path);

    const transcription = await transcribeAudio(audioPath);

    await db.collection("transcriptions").doc(docRef.id).update({
      status: TranscriptionStatus.DONE,
      transcript: transcription,
      finishedAt: new Date(),
    });

    // remove arquivos temporários
    fs.unlinkSync(file.path);
    fs.unlinkSync(audioPath);
  } catch (err) {
    await db.collection("transcriptions").doc(docRef.id).update({
      status: TranscriptionStatus.ERROR,
      error: (err as Error).message,
    });
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

