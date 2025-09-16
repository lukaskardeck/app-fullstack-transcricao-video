import { markTranscriptionDone, markTranscriptionError } from "../models/TranscriptionModel";
import { UsageStatus, updateUsageLogStatus } from "../models/UsageLogModel";
import { prepareAudioForTranscription } from "./ffmpegService";
import { transcribeAudio } from "./openaiService";
import fs from "fs";

export const processTranscriptionAsync = async (
  filePath: string,
  extension: string,
  transcriptionId: string,
  usageLogId: string
) => {
  let audioPath: string | undefined;
  let compressedPath: string | undefined;

  try {
    const isVideo = extension === "mp4";

    // converte/comprime conforme necessário
    audioPath = await prepareAudioForTranscription(filePath, isVideo);
    compressedPath = audioPath !== filePath ? audioPath : undefined;

    // transcreve
    const transcriptText = await transcribeAudio(audioPath);

    await markTranscriptionDone(transcriptionId, transcriptText);
    await updateUsageLogStatus(usageLogId, UsageStatus.DONE);

  } catch (err) {
    const errorMessage = (err as Error).message || "Erro desconhecido";

    await markTranscriptionError(transcriptionId, errorMessage);
    await updateUsageLogStatus(usageLogId, UsageStatus.ERROR);

  } finally {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (compressedPath && compressedPath !== filePath && fs.existsSync(compressedPath)) {
        fs.unlinkSync(compressedPath);
      }

      if (audioPath && audioPath !== filePath && audioPath !== compressedPath && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    } catch (cleanupError) {
      console.warn("Erro ao limpar arquivos temporários:", cleanupError);
    }
  }
};