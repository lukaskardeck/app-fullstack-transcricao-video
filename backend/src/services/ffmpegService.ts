import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

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

export async function getMediaDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration || 0;
      if (!duration) return reject(new Error("Não foi possível obter a duração do arquivo"));
      resolve(Math.floor(duration)); // retorna em segundos
    });
  });
}
