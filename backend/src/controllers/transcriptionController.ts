import { Request, Response } from "express";
import { db } from "../config/firebase";
import { convertVideoToAudio, getVideoDuration } from "../services/ffmpegService";
import { transcribeAudio } from "../services/openaiService";
import fs from "fs";
import { createTranscription, getTranscriptionById, listTranscriptionsByUser, TranscriptionStatus, updateTranscriptionText } from "../models/TranscriptionModel";

// Solicitação de transcrição de vídeo
export async function createTranscriptionRequest(req: Request, res: Response) {
  const user = (req as any).user;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "Arquivo não enviado" });

  try {
    // Obtém a duração do arquivo em segundos
    const duration = await getVideoDuration(file.path);

    // Pega a extensão do arquivo (ex: .mp4, .mp3, etc.)
    const extension = file.originalname.split('.').pop() || '';

    const transcription = await createTranscription({ 
      fileName: file.originalname, 
      userId: user.uid, 
      duration,
      extension,
    });

    res.status(202).json(transcription);

    // processamento assíncrono
    try {
      const audioPath = await convertVideoToAudio(file.path);

      const transcriptText = await transcribeAudio(audioPath);

      await db.collection("transcriptions").doc(transcription.id).update({
        status: TranscriptionStatus.DONE,
        transcript: transcriptText,
        finishedAt: new Date(),
      });

      // remove arquivos temporários
      fs.unlinkSync(file.path);
      fs.unlinkSync(audioPath);
    } catch (err) {
      await db.collection("transcriptions").doc(transcription.id).update({
        status: TranscriptionStatus.ERROR,
        error: (err as Error).message,
      });
    }
  } catch (err) {
    console.error("Erro ao criar transcrição:", err);
    res.status(500).json({ error: "Erro ao processar vídeo" });
  }
}


// Listar transcrições do usuário
export const listTranscriptions = async (req: any, res: Response) => {
  try {
    const transcriptions = await listTranscriptionsByUser(req.user.uid);
    res.json(transcriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar transcrições" });
  }
};


// Atualizar transcrição existente
export const updateTranscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ error: "Campo 'transcript' é obrigatório" });

    const updated = await updateTranscriptionText(id, transcript);
    if (!updated) return res.status(404).json({ error: "Transcrição não encontrada" });

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};

// Download da transcrição
export const downloadTranscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transcription = await getTranscriptionById(id);
    if (!transcription) return res.status(404).json({ error: "Transcrição não encontrada" });

    const text = transcription.transcript || "";
    const filename = transcription.fileName.replace(/\.[^/.]+$/, "") + ".txt";

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "text/plain;charset=utf-8");
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar download" });
  }
};