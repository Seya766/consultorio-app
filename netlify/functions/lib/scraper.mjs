import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://unimagdalena.gestionjuridica.com';
const CAPSOLVER_API = 'https://api.capsolver.com';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'es-419,es;q=0.9,es-ES;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Upgrade-Insecure-Requests': '1',
  'Sec-CH-UA': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
  'Sec-CH-UA-Mobile': '?0',
  'Sec-CH-UA-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-User': '?1',
  'DNT': '1',
  'Cache-Control': 'no-cache',
};

// ── Cookie-aware session ──

function createSession() {
  let cookies = {};

  const instance = axios.create({
    baseURL: BASE_URL,
    maxRedirects: 0,
    validateStatus: () => true,
    decompress: true,
  });

  instance.interceptors.response.use((res) => {
    const setCookies = res.headers['set-cookie'];
    if (setCookies) {
      for (const raw of setCookies) {
        const [pair] = raw.split(';');
        const eq = pair.indexOf('=');
        if (eq > 0) cookies[pair.substring(0, eq).trim()] = pair.substring(eq + 1);
      }
    }
    return res;
  });

  instance.interceptors.request.use((cfg) => {
    const str = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
    if (str) cfg.headers['Cookie'] = str;
    return cfg;
  });

  const setCookie = (name, value) => { cookies[name] = value; };

  async function followRedirects(res) {
    let r = res;
    let hops = 0;
    while ((r.status === 301 || r.status === 302) && hops < 10) {
      const loc = r.headers['location'] || '';
      r = await instance.get(loc, { headers: { ...BROWSER_HEADERS, 'Sec-Fetch-Site': 'same-origin' } });
      hops++;
    }
    return r;
  }

  return { instance, setCookie, followRedirects };
}

// ── CapSolver: resolve AWS WAF challenge ──

async function solveWafChallenge(challengeHtml, targetUrl) {
  const apiKey = process.env.CAPSOLVER_API_KEY;
  if (!apiKey) throw new Error('CAPSOLVER_API_KEY no configurada');

  // Extract gokuProps from challenge page
  const match = challengeHtml.match(/gokuProps\s*=\s*(\{[\s\S]*?\})\s*;/);
  if (!match) throw new Error('No se encontraron gokuProps en la página WAF');

  let goku;
  try {
    goku = JSON.parse(match[1].replace(/'/g, '"'));
  } catch {
    // Try evaluating as relaxed JSON
    const keyMatch = challengeHtml.match(/"key"\s*:\s*"([^"]+)"/);
    const ivMatch = challengeHtml.match(/"iv"\s*:\s*"([^"]+)"/);
    const ctxMatch = challengeHtml.match(/"context"\s*:\s*"([^"]+)"/);
    goku = {
      key: keyMatch?.[1],
      iv: ivMatch?.[1],
      context: ctxMatch?.[1],
    };
  }

  // Find challenge.js URL
  const jsMatch = challengeHtml.match(/src="(https:\/\/[^"]*challenge\.js[^"]*)"/);
  const challengeJs = jsMatch?.[1] || '';

  if (!goku.key) throw new Error('No se pudo extraer awsKey de gokuProps');

  // Create CapSolver task
  const createRes = await axios.post(`${CAPSOLVER_API}/createTask`, {
    clientKey: apiKey,
    task: {
      type: 'AntiAwsWafTaskProxyLess',
      websiteURL: targetUrl,
      awsKey: goku.key,
      awsIv: goku.iv || '',
      awsContext: goku.context || '',
      awsChallengeJS: challengeJs,
    },
  });

  if (createRes.data.errorId) {
    throw new Error(`CapSolver error: ${createRes.data.errorDescription || createRes.data.errorCode}`);
  }

  const taskId = createRes.data.taskId;

  // Poll for result (max ~20s)
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const result = await axios.post(`${CAPSOLVER_API}/getTaskResult`, {
      clientKey: apiKey,
      taskId,
    });

    if (result.data.status === 'ready') {
      return result.data.solution.cookie;
    }

    if (result.data.errorId) {
      throw new Error(`CapSolver solve error: ${result.data.errorDescription || result.data.errorCode}`);
    }
  }

  throw new Error('CapSolver timeout: no se pudo resolver el WAF challenge');
}

// ── Login flow ──

export async function login(username, password) {
  const { instance, setCookie, followRedirects } = createSession();

  // 1. Fetch login page (will get WAF challenge)
  const initial = await instance.get('/au/login', {
    headers: { ...BROWSER_HEADERS, 'Sec-Fetch-Site': 'none' },
  });

  let html = initial.data || '';

  // 2. If WAF challenge, solve it with CapSolver
  if (initial.status === 405 || initial.status === 202 || html.includes('gokuProps')) {
    const wafToken = await solveWafChallenge(html, `${BASE_URL}/au/login`);

    // Set the aws-waf-token cookie
    setCookie('aws-waf-token', wafToken);

    // Retry the login page with the WAF token
    const retryPage = await instance.get('/au/login', {
      headers: { ...BROWSER_HEADERS, 'Sec-Fetch-Site': 'none' },
    });
    const followed = await followRedirects(retryPage);
    html = followed.data || '';
  }

  // 3. Extract CSRF token from real login page
  const $ = cheerio.load(html);
  const csrfToken = $('input[name="_token"]').val();

  if (!csrfToken) {
    const snippet = html.substring(0, 300);
    throw new Error(`No se encontró el formulario de login (len: ${html.length}, preview: ${snippet})`);
  }

  // 4. POST login
  const params = new URLSearchParams();
  params.append('_token', csrfToken);
  params.append('username', username);
  params.append('password', password);

  const loginRes = await instance.post('/au/login', params.toString(), {
    headers: {
      ...BROWSER_HEADERS,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': BASE_URL,
      'Referer': `${BASE_URL}/au/`,
      'Sec-Fetch-Site': 'same-origin',
    },
  });

  const location = loginRes.headers['location'] || '';

  if (loginRes.status === 302 && location.includes('/au/login')) {
    throw new Error('Credenciales incorrectas');
  }

  // 5. Follow redirect to /au/Users
  if (loginRes.status === 302) {
    const page = await followRedirects(loginRes);
    return { instance, followRedirects, html: page.data, redirectedTo: location };
  }

  if (loginRes.data?.includes('name="password"')) {
    throw new Error('Credenciales incorrectas');
  }

  return { instance, followRedirects, html: loginRes.data, redirectedTo: '' };
}
