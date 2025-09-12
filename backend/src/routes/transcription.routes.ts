import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { createTranscriptionRequest, listTranscriptions } from "../controllers/transcriptionController";
import { upload } from "../middleware/upload";

const router = Router();

// video é enviado via form-data com campo "video"
router.post("/", verifyToken, upload.single("video"), createTranscriptionRequest);

// GET /api/transcriptions
router.get("/", verifyToken, listTranscriptions);

export default router;
