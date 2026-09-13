const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pontosRouter = require('./routes/pontos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/pontos', pontosRouter);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API do Mapa de Pontos de Coleta rodando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
