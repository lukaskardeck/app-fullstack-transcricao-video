import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

// garante que a pasta existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // salva com timestamp para evitar conflitos
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

function fileFilter(req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowedTypes = ["video/mp4", "audio/mpeg"]; // Aceita arquivos .mp4 e .mp3

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Somente arquivos .mp4 e .mp3 são permitidos!"));
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter,
});
