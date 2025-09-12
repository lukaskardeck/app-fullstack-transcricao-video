import { Router } from "express";
import authRouter from "./auth.routes";
import transcriptionRouter from "./transcription.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/transcription", transcriptionRouter);

export default router;
