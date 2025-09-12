import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { validateToken } from "../controllers/authController";

const router = Router();

router.post("/validate-token", verifyToken, validateToken);

export default router;
