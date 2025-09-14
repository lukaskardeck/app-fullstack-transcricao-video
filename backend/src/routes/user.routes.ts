import express from "express";
import { verifyToken } from "../middleware/auth";
import { registerUser, getDailyQuota } from "../controllers/userController";

const router = express.Router();

// POST /api/user/register
// Cria documento de usuário no Firestore
router.post("/register", verifyToken, registerUser);

// GET /api/user/quota
// Retorna uso diário e limite do usuário
router.get("/quota", verifyToken, getDailyQuota);

export default router;
