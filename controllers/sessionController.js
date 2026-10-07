// controllers/sessionController.js
const { getSession } = require('../services/getSession');

async function createSession(req, res) {
  try {
    console.log('🚀 Nova requisição de sessão');

    const session = await getSession();

    console.log('✅ Sessão criada com sucesso');

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('❌ Erro ao criar sessão:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = { createSession };