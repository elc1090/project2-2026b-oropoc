import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pontosRouter from './routes/pontos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/pontos', pontosRouter);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API do Mapa de Pontos de Coleta rodando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
