import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://unimagdalena.gestionjuridica.com';

function createSession() {
  let cookies = {};

  const session = axios.create({
    baseURL: BASE_URL,
    maxRedirects: 0,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-419,es;q=0.9',
    },
    validateStatus: (status) => status < 500,
  });

  session.interceptors.response.use((response) => {
    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      for (const raw of setCookies) {
        const [pair] = raw.split(';');
        const [name, ...rest] = pair.split('=');
        cookies[name.trim()] = rest.join('=');
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

  return session;
}

export async function login(username, password) {
  const session = createSession();

  // 1. GET login page to get CSRF token + session cookies
  const loginPage = await session.get('/au/login');
  const $ = cheerio.load(loginPage.data);
  const token = $('input[name="_token"]').val();

  if (!token) {
    throw new Error('No se pudo obtener el token CSRF de la plataforma');
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
      'Referer': `${BASE_URL}/au/login`,
    },
  });

  // Laravel returns 302 to /au/Users on success, 302 to /au/login on failure
  const location = loginResponse.headers['location'] || '';

  if (loginResponse.status === 302 && location.includes('/au/Users')) {
    // Follow redirect to get the user page
    const usersPage = await session.get('/au/Users');
    return { session, html: usersPage.data };
  }

  if (loginResponse.status === 302 && location.includes('/au/login')) {
    throw new Error('Credenciales incorrectas');
  }

  // If we got a 200 back, check if it's the login form again
  if (loginResponse.data && loginResponse.data.includes('name="password"')) {
    throw new Error('Credenciales incorrectas');
  }

  // Might have landed on the page directly
  return { session, html: loginResponse.data };
}
