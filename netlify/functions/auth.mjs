import { login } from './lib/scraper.mjs';
import * as cheerio from 'cheerio';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: 'Usuario y contraseña son requeridos' }),
      };
    }

    const { html } = await login(username, password);
    const $ = cheerio.load(html);

    // Extract user name from the page
    const userName =
      $('.navbar-nav .nav-link, .user-name, .dropdown-toggle').first().text().trim() ||
      $('body').text().match(/Bienvenid[oa]\s*[,:]?\s*(.+?)[\n\r]/)?.[1]?.trim() ||
      username;

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success: true,
        user: { name: userName, username },
        message: 'Sesión iniciada correctamente',
      }),
    };
  } catch (error) {
    const status = error.message.includes('Credenciales') ? 401 : 500;
    return {
      statusCode: status,
      headers: CORS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
