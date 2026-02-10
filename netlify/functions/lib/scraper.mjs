import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const BASE_URL = 'https://unimagdalena.gestionjuridica.com';

async function launchBrowser() {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  return browser;
}

export async function login(username, password) {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();

    // Navigate to login page (real Chrome passes WAF automatically)
    await page.goto(`${BASE_URL}/au/login`, { waitUntil: 'networkidle2', timeout: 15000 });

    // Wait for the login form to appear (after WAF challenge resolves)
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });

    // Fill in credentials
    await page.type('input[name="username"]', username, { delay: 30 });
    await page.type('input[name="password"]', password, { delay: 30 });

    // Submit form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
      page.click('button[role="submit"], button[type="submit"], .btn'),
    ]);

    const currentUrl = page.url();

    // Check if we're still on login (bad credentials)
    if (currentUrl.includes('/au/login')) {
      throw new Error('Credenciales incorrectas');
    }

    // Get page HTML
    const html = await page.content();

    return { browser, page, html, url: currentUrl };
  } catch (error) {
    await browser.close();
    throw error;
  }
}
