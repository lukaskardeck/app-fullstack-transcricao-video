import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

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
