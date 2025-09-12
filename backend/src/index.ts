import express from "express";
import routes from "./routes/index"; // importa todas as rotas combinadas

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json()); // Middleware para parsear JSON
app.use("/api", routes); // Todas as rotas terão o prefixo /api

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
