import { Request, Response } from "express";
import { db } from "../config/firebase";
import { convertVideoToAudio, getVideoDuration } from "../services/ffmpegService";
import { transcribeAudio } from "../services/openaiService";
import fs from "fs";
import { createTranscription, getTranscriptionById, getTranscriptionsByUser, TranscriptionStatus, updateTranscriptionText } from "../models/TranscriptionModel";
import { getUserById } from "../models/UserModel";
import { createUsageLog, updateUsageLogStatus, UsageStatus } from "../models/UsageLogModel";
import { checkDailyQuota } from "../services/quotaService";
import { processTranscriptionAsync } from "../services/transcriptionService";

// Upload de vídeo e criação da transcrição
export async function createTranscriptionRequest(req: Request, res: Response) {
  const user = (req as any).user;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Arquivo não enviado" });

  try {
    const userData = await getUserById(user.uid);
    if (!userData) return res.status(404).json({ error: "Usuário não encontrado" });

    const duration = await getVideoDuration(file.path);
    const canUpload = await checkDailyQuota(user.uid, duration);
    if (!canUpload) return res.status(403).json({ error: "O arquivo excede o limite diário de upload" });

    const extension = file.originalname.split(".").pop() || "";

    const transcription = await createTranscription({
      fileName: file.originalname,
      userId: user.uid,
      duration,
      extension,
    });

    const usageLog = await createUsageLog({
      userId: user.uid,
      transcriptionId: transcription.id,
      duration,
      status: UsageStatus.PENDING,
    });

    res.status(202).json(transcription);

    // Processamento assíncrono da transcrição
    processTranscriptionAsync(file.path, transcription.id, usageLog.id);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar vídeo" });
  }
}


// Listar transcrições do usuário
export const listTranscriptions = async (req: any, res: Response) => {
  try {
    const transcriptions = await getTranscriptionsByUser(req.user.uid);
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