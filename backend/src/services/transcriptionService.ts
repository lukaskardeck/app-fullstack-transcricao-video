import { markTranscriptionDone, markTranscriptionError } from "../models/TranscriptionModel";
import { UsageStatus, updateUsageLogStatus } from "../models/UsageLogModel";
import { convertVideoToAudio } from "./ffmpegService";
import { transcribeAudio } from "./openaiService";
import fs from "fs";

export const processTranscriptionAsync = async (
  filePath: string,
  extension: string,
  transcriptionId: string,
  usageLogId: string
) => {

  let audioPath: string | undefined;

  try {
    if (extension === "mp3") {
      // já é áudio, não precisa converter
      audioPath = filePath;
    } else {
      // converter vídeo para áudio
      audioPath = await convertVideoToAudio(filePath);
    }

    // Realiza a transcrição do áudio
    const transcriptText = await transcribeAudio(audioPath);

    // Marca a transcrição como concluída (DONE) e atualiza o transcript
    await markTranscriptionDone(transcriptionId, transcriptText);

    // Atualiza o log de uso como concluído
    await updateUsageLogStatus(usageLogId, UsageStatus.DONE);

  } catch (err) {
    const errorMessage = (err as Error).message || "Erro desconhecido";

    // Marca a transcrição como erro (ERROR) com mensagem
    await markTranscriptionError(transcriptionId, errorMessage);

    // Atualiza o log de uso como erro
    await updateUsageLogStatus(usageLogId, UsageStatus.ERROR);

  } finally {
    // Se for mp3, não apagar o arquivo original (filePath === audioPath)
    if (filePath !== audioPath) {
      fs.unlinkSync(filePath);
    }
    // Apagar o arquivo de áudio temporário se foi criado
    if (audioPath && audioPath !== filePath) {
      fs.unlinkSync(audioPath);
    }
  }
};
