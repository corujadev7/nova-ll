// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const { createSession } = require('../controllers/sessionController');

// Middleware de autenticação
function auth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.API_SECRET || 'troque-essa-chave';

  if (apiKey !== validKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// POST /api/session
router.post('/session', auth, createSession);

module.exports = router;