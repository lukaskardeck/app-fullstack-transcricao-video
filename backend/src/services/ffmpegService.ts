import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import fs from "fs";

ffmpeg.setFfprobePath(ffprobePath.path);
ffmpeg.setFfmpegPath(ffmpegPath!);

export function convertVideoToAudio(videoPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputPath = videoPath.replace(/\.[^/.]+$/, ".mp3");

    ffmpeg(videoPath)
      .toFormat("mp3")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}


function getDynamicBitrate(fileSize: number): string {
  const sizeMB = fileSize / (1024 * 1024);
  if (sizeMB <= 40) return "128k";
  if (sizeMB <= 100) return "64k";
  return "32k";
}


export function compressAudioForTranscription(inputPath: string): Promise<string> {
  const inputSize = fs.statSync(inputPath).size;
  const bitrate = getDynamicBitrate(inputSize);
  const outputPath = inputPath.replace(/\.[^/.]+$/, "_compressed.aac");

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("aac")
      .audioCodec("aac")
      .audioBitrate(bitrate)
      .audioChannels(1)
      .audioFrequency(16000)
      .noVideo()
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}


export async function checkFileSize(filePath: string): Promise<number> {
  const stats = fs.statSync(filePath);
  return stats.size;
}


export async function prepareAudioForTranscription(filePath: string, isVideo: boolean = false): Promise<string> {
  const maxSize = 24 * 1024 * 1024;

  let audioPath = filePath;

  if (isVideo) {
    audioPath = await convertVideoToAudio(filePath);
  }

  const fileSize = await checkFileSize(audioPath);

  if (fileSize > maxSize) {
    const compressedPath = await compressAudioForTranscription(audioPath);

    if (audioPath !== filePath) {
      try {
        fs.unlinkSync(audioPath);
      } catch (err: any) {
        if (err) {
          throw new Error("Erro ao remover arquivo temporário de áudio.");
        }
      }
    }

    const finalSize = await checkFileSize(compressedPath);

    if (finalSize > maxSize) {
      fs.unlinkSync(compressedPath);
      throw new Error("Arquivo muito grande mesmo após compressão. Tente um arquivo menor.");
    }
    return compressedPath;
  }

  return audioPath;
}


export async function getMediaDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration || 0;
      if (!duration) return reject(new Error("Não foi possível obter a duração do arquivo"));
      resolve(Math.floor(duration));
    });
  });
}