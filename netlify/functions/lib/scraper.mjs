import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://unimagdalena.gestionjuridica.com';
const MAX_REDIRECTS = 10;

function createSession() {
  let cookies = {};

  const session = axios.create({
    baseURL: BASE_URL,
    maxRedirects: 0,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'es-419,es;q=0.9,es-ES;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1',
      'Sec-CH-UA': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
    },
    validateStatus: () => true,
    decompress: true,
  });

  session.interceptors.response.use((response) => {
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

  session.interceptors.request.use((config) => {
    const cookieStr = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
    if (cookieStr) {
      config.headers['Cookie'] = cookieStr;
    }
    return config;
  });

  // Helper: follow redirects manually to capture all cookies
  session.getFollowRedirects = async (url) => {
    let response = await session.get(url);
    let hops = 0;
    while ((response.status === 301 || response.status === 302) && hops < MAX_REDIRECTS) {
      const location = response.headers['location'] || '';
      const nextUrl = location.startsWith('http') ? location : location;
      response = await session.get(nextUrl);
      hops++;
    }
    return response;
  };

  return session;
}

export async function login(username, password) {
  const session = createSession();

  // 1. GET login page following all redirects to collect cookies
  const loginPage = await session.getFollowRedirects('/au/login');

  const $ = cheerio.load(loginPage.data || '');
  const token = $('input[name="_token"]').val();

  if (!token) {
    throw new Error(
      `No se pudo obtener el token CSRF (status: ${loginPage.status}, url: /au/login, bodyLength: ${(loginPage.data || '').length})`
    );
  }

  // 2. POST login
  const params = new URLSearchParams();
  params.append('_token', token);
  params.append('username', username);
  params.append('password', password);

  const loginResponse = await session.post('/au/login', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': BASE_URL,
      'Referer': `${BASE_URL}/au/`,
      'Sec-Fetch-Site': 'same-origin',
    },
  });

  // Laravel returns 302 on login
  const location = loginResponse.headers['location'] || '';

  if (loginResponse.status === 302 && location.includes('/au/login')) {
    throw new Error('Credenciales incorrectas');
  }

  // Follow redirect (to /au/Users or wherever it goes)
  if (loginResponse.status === 302) {
    const page = await session.getFollowRedirects(location);
    return { session, html: page.data, redirectedTo: location };
  }

  // Check if response is the login form again
  if (loginResponse.data && loginResponse.data.includes('name="password"')) {
    throw new Error('Credenciales incorrectas');
  }

  return { session, html: loginResponse.data, redirectedTo: '' };
}
