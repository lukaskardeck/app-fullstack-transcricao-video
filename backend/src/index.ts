import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { verifyToken } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8181;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send(`Servidor rodando na porta ${PORT}`);
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend está vivo!" });
});

app.get("/api/secure", verifyToken, (req, res) => {
  res.json({ message: "Acesso autorizado", user: (req as any).user });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
