// anticaptcha.js
const ac = require('@antiadmin/anticaptchaofficial');

// Configura a API Key uma vez só
ac.setAPIKey('a6ea8e7a45a476fd062dbf1b6f32c391');

// Opcional: seu softId para ganhar comissão (deixe 0 se não tiver)
ac.setSoftId(0);

/**
 * Resolve o Cloudflare Turnstile via Anti-Captcha
 * @param {string} siteUrl - URL da página que contém o Turnstile
 * @param {string} siteKey - Sitekey do Turnstile (0x4AAAAAABpF5mikgYMo5Mk-)
 * @returns {Promise<{token: string, userAgent: string}>}
 */
async function solveTurnstile(siteUrl, siteKey) {
  try {
    console.log('🧩 Enviando Turnstile para o Anti-Captcha...');
    
    const token = await ac.solveTurnstileProxyless(
      siteUrl,
      siteKey
      // 'action' opcional
      // 'cData' opcional
      // 'chlPageData' opcional
    );

    const userAgent = ac.getUserAgent();

    console.log('✅ Token obtido:', token.substring(0, 50) + '...');
    console.log('👤 User-Agent do worker:', userAgent);

    return { token, userAgent };
  } catch (error) {
    console.error('❌ Erro ao resolver Turnstile:', error);
    throw error;
  }
}

module.exports = { solveTurnstile };