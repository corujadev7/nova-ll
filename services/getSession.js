// services/getCookies.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { solveTurnstile } = require('./anticaptcha');

puppeteer.use(StealthPlugin());

const TURNSTILE_SITEKEY = '0x4AAAAAABpF5mikgYMo5Mk-';
const PAGE_URL = 'https://www.sefaz.mt.gov.br/ipva/emissaoguia/emitir';

/**
 * Resolve o captcha da SEFAZ-MT e retorna JWT, datacadastro, cookies e userAgent
 * @returns {Promise<Object>}
 */
async function getSession() {
  let browser;
  try {
    // 1. Resolve Turnstile
    const { token, userAgent } = await solveTurnstile(PAGE_URL, TURNSTILE_SITEKEY);

    // 2. Abre Puppeteer com o UA do worker
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        `--user-agent=${userAgent}`
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    // 3. Navega
    await page.goto(PAGE_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // 4. Aguarda o JS da SEFAZ
    await page.waitForFunction(
      () => typeof window.validateWithApi === 'function',
      { timeout: 30000 }
    );

    // 5. Chama validateWithApi
    const navigationPromise = page
      .waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 })
      .catch(() => null);

    await page.evaluate((token) => {
      return window.validateWithApi(token, 'cloudflare');
    }, token);

    await navigationPromise;

    // 6. Extrai JWT e datacadastro
    await page.waitForSelector('input[name="jwt"]', { timeout: 30000 });

    const dados = await page.evaluate(() => {
      const jwtEl = document.querySelector('input[name="jwt"]');
      const dataEl = document.querySelector('input[name="datacadastro"]');
      return {
        jwt: jwtEl ? jwtEl.value : null,
        datacadastro: dataEl ? dataEl.value : null,
      };
    });

    // 7. Extrai cookies
    const cookies = await page.cookies();
    const cookieHeader = cookies
      .map(c => `${c.name}=${c.value}`)
      .join('; ');

    return {
      jwt: dados.jwt,
      datacadastro: dados.datacadastro,
      userAgent,
      cookieHeader,
      cookies: Object.fromEntries(cookies.map(c => [c.name, c.value])),
      extractedAt: new Date().toISOString()
    };

  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { getSession };