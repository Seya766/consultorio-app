import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://unimagdalena.gestionjuridica.com';
const MAX_REDIRECTS = 10;

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'es-419,es;q=0.9,es-ES;q=0.8,en;q=0.7,en-GB;q=0.6,en-US;q=0.5,es-CO;q=0.4',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Cache-Control': 'no-cache',
  'DNT': '1',
  'Upgrade-Insecure-Requests': '1',
  'Sec-CH-UA': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
  'Sec-CH-UA-Mobile': '?0',
  'Sec-CH-UA-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-User': '?1',
};

function createSession() {
  let cookies = {};

  const instance = axios.create({
    baseURL: BASE_URL,
    maxRedirects: 0,
    validateStatus: () => true,
    decompress: true,
  });

  instance.interceptors.response.use((response) => {
    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      for (const raw of setCookies) {
        const [pair] = raw.split(';');
        const eqIndex = pair.indexOf('=');
        if (eqIndex > 0) {
          const name = pair.substring(0, eqIndex).trim();
          const value = pair.substring(eqIndex + 1);
          cookies[name] = value;
        }
      }
    }
    return response;
  });

  instance.interceptors.request.use((config) => {
    const cookieStr = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
    if (cookieStr) {
      config.headers['Cookie'] = cookieStr;
    }
    return config;
  });

  // Follow redirects manually, capturing cookies at each hop
  async function followRedirects(response) {
    let res = response;
    let hops = 0;
    while ((res.status === 301 || res.status === 302) && hops < MAX_REDIRECTS) {
      const loc = res.headers['location'] || '';
      const url = loc.startsWith('http') ? loc : loc;
      res = await instance.get(url, {
        headers: { ...BROWSER_HEADERS, 'Sec-Fetch-Site': 'same-origin', 'Referer': BASE_URL + '/' },
      });
      hops++;
    }
    return res;
  }

  return { instance, followRedirects };
}

export async function login(username, password) {
  const { instance, followRedirects } = createSession();

  // 1. Visit /au/ first to establish initial cookies, then follow to login
  const initial = await instance.get('/au/', {
    headers: { ...BROWSER_HEADERS, 'Sec-Fetch-Site': 'none' },
  });
  const loginPage = await followRedirects(initial);

  // If we didn't land on a page with a form, try /au/login directly
  let html = loginPage.data || '';
  if (!html.includes('_token')) {
    const directLogin = await instance.get('/au/login', {
      headers: { ...BROWSER_HEADERS, 'Sec-Fetch-Site': 'same-origin', 'Referer': BASE_URL + '/au/' },
    });
    const followed = await followRedirects(directLogin);
    html = followed.data || '';
  }

  const $ = cheerio.load(html);
  const token = $('input[name="_token"]').val();

  if (!token) {
    // Return more debug info to help fix
    const snippet = html.substring(0, 500).replace(/</g, '&lt;');
    throw new Error(
      `No se pudo obtener el token CSRF (status: ${loginPage.status}, bodyLen: ${html.length}, snippet: ${snippet})`
    );
  }

  // 2. POST login with same headers as the browser
  const params = new URLSearchParams();
  params.append('_token', token);
  params.append('username', username);
  params.append('password', password);

  const loginResponse = await instance.post('/au/login', params.toString(), {
    headers: {
      ...BROWSER_HEADERS,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': BASE_URL,
      'Referer': `${BASE_URL}/au/`,
      'Sec-Fetch-Site': 'same-origin',
    },
  });

  const location = loginResponse.headers['location'] || '';

  if (loginResponse.status === 302 && location.includes('/au/login')) {
    throw new Error('Credenciales incorrectas');
  }

  // Follow redirect (to /au/Users)
  if (loginResponse.status === 302) {
    const page = await followRedirects(loginResponse);
    return { instance, followRedirects, html: page.data, redirectedTo: location };
  }

  if (loginResponse.data && loginResponse.data.includes('name="password"')) {
    throw new Error('Credenciales incorrectas');
  }

  return { instance, followRedirects, html: loginResponse.data, redirectedTo: '' };
}
