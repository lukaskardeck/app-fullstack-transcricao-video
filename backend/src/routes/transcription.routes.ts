import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { 
    createTranscriptionRequest, 
    downloadTranscription, 
    getTranscription, 
    listTranscriptions, 
    updateTranscription 
} from "../controllers/transcriptionController";
import { upload } from "../middleware/upload";

const router = Router();

// POST /api/transcription
router.post("/", verifyToken, upload.single("file"), createTranscriptionRequest);

// GET /api/transcription
router.get("/", verifyToken, listTranscriptions);

// GET /api/transcription/:id
router.get("/:id", verifyToken, getTranscription);

// GET /api/transcription/download/:id
router.get("/download/:id", verifyToken, downloadTranscription);

// PUT /api/transcription/:id
router.put("/:id", verifyToken, updateTranscription);

export default router;
