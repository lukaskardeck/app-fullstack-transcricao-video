import { Request, Response } from "express";
import { db } from "../config/firebase";
import { convertVideoToAudio, getVideoDuration } from "../services/ffmpegService";
import { transcribeAudio } from "../services/openaiService";
import fs from "fs";
import { createTranscription, getTranscriptionById, listTranscriptionsByUser, TranscriptionStatus, updateTranscriptionText } from "../models/TranscriptionModel";
import { getUserById } from "../models/User";
import { createUsageLog, updateUsageLogStatus } from "../models/UsageLog";

// Solicitação de transcrição de vídeo
export async function createTranscriptionRequest(req: Request, res: Response) {
  const user = (req as any).user;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "Arquivo não enviado" });

  try {
    // Verifica se o usuário existe no banco de dados
    const userData = await getUserById(user.uid);
    if (!userData) return res.status(404).json({ error: "Usuário não encontrado" });
  
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

    // Cria log de uso (inicialmente como pending)
    const usageLog = await createUsageLog({
      userId: user.uid,
      transcriptionId: transcription.id,
      duration,
      status: "pending",
    });

    res.status(202).json(transcription);

    // processamento assíncrono da transcrição
    try {
      
      // Converte vídeo para áudio
      const audioPath = await convertVideoToAudio(file.path);

      // Transcreve áudio
      const transcriptText = await transcribeAudio(audioPath);

      // Atualiza o status do transcription para "done"
      await db.collection("transcriptions").doc(transcription.id).update({
        status: TranscriptionStatus.DONE,
        transcript: transcriptText,
        finishedAt: new Date(),
      });

      // Marca o log como concluído
      await updateUsageLogStatus(usageLog.id, "done");

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