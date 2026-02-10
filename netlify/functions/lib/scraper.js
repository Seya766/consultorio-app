const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://unimagdalena.gestionjuridica.com';

async function createSession() {
  const session = axios.create({
    baseURL: BASE_URL,
    maxRedirects: 5,
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  // Axios doesn't handle cookies automatically, so we track them manually
  let cookies = '';

  session.interceptors.response.use((response) => {
    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      const parsed = setCookies.map((c) => c.split(';')[0]).join('; ');
      cookies = parsed;
    }
    return response;
  });

  session.interceptors.request.use((config) => {
    if (cookies) {
      config.headers['Cookie'] = cookies;
    }
    return config;
  });

  return session;
}

async function login(username, password) {
  const session = await createSession();

  // 1. Get login page to extract CSRF token
  const loginPage = await session.get('/au/login');
  const $ = cheerio.load(loginPage.data);
  const token = $('input[name="_token"]').val();

  if (!token) {
    throw new Error('No se pudo obtener el token CSRF');
  }

  // 2. POST login credentials
  const params = new URLSearchParams();
  params.append('_token', token);
  params.append('username', username);
  params.append('password', password);

  const loginResponse = await session.post('/au/login', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    maxRedirects: 5,
    validateStatus: (status) => status < 400 || status === 302,
  });

  // Check if login succeeded (Laravel redirects to /au/home on success)
  const finalUrl = loginResponse.request?.res?.responseUrl || loginResponse.headers?.location || '';
  const html = loginResponse.data || '';

  if (finalUrl.includes('/au/login') || html.includes('form') && html.includes('_token') && html.includes('password')) {
    throw new Error('Credenciales incorrectas');
  }

  return session;
}

module.exports = { login, createSession, BASE_URL };
