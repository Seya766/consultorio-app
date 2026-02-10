const { login } = require('./lib/scraper');
const cheerio = require('cheerio');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Usuario y contraseña son requeridos' }),
      };
    }

    const session = await login(username, password);

    // Fetch the home/dashboard page to extract user info
    const homePage = await session.get('/au/home');
    const $ = cheerio.load(homePage.data);

    // Try to extract user info from the dashboard
    // These selectors will need adjustment based on the actual page structure
    const userName = $('nav .navbar-nav .nav-link, .user-name, .dropdown-toggle, .nav-item .nav-link').first().text().trim()
      || $('body').text().match(/Bienvenid[oa]\s+(.+?)[\n,]/)?.[1]?.trim()
      || username;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          name: userName,
          username,
        },
        message: 'Sesión iniciada correctamente en Gestión Jurídica',
      }),
    };
  } catch (error) {
    const status = error.message.includes('Credenciales') ? 401 : 500;
    return {
      statusCode: status,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
