import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_FILE_SIZE = 200; // 200MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowedTypes = ["video/mp4", "audio/mpeg"];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("Somente arquivos .mp4 e .mp3 são permitidos!"));
  } else {
    cb(null, true);
  }
}

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE * 1024 * 1024 }, // em bytes
    fileFilter,
  }).single("file");

  upload(req, res, (err) => {
    // Tratamento de erros do Multer
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            error: "Arquivo muito grande. Tamanho máximo permitido é de " + MAX_FILE_SIZE + "MB",
            code: "FILE_TOO_LARGE",
          });
        }
        return res.status(400).json({
          success: false,
          error: "Erro no upload do arquivo",
          code: "UPLOAD_ERROR",
        });
      }

      // fileFilter ou outros erros
      return res.status(400).json({
        success: false,
        error: err.message || "Erro no upload do arquivo",
        code: "UPLOAD_ERROR",
      });
    }

    // Se passar, marca flag de que o arquivo é grande
    if (req.file) {
      const fileSizeMB = req.file.size / (1024 * 1024);
      (req as any).largeFile = fileSizeMB > 25;
    }

    next(); // segue para o controller
  });
};
