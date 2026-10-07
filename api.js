// api.js
const express = require('express');
const sessionRoutes = require('./routes/sessionRoutes');
const dotenv = require('dotenv')

dotenv.config();
const app = express();

// Middlewares globais
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api', sessionRoutes);

// Handler global de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});