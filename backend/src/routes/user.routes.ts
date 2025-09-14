import express from "express";
import { verifyToken } from "../middleware/auth";
import { registerUser } from "../controllers/userController";

const router = express.Router();

// POST /api/user/register
// Cria documento de usuário no Firestore
router.post("/register", verifyToken, registerUser);

export default router;
