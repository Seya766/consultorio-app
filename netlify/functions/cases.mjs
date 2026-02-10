import { login } from './lib/scraper.mjs';
import * as cheerio from 'cheerio';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
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
        body: JSON.stringify({ error: 'Credenciales requeridas' }),
      };
    }

    const { instance, followRedirects, html } = await login(username, password);

    // Collect nav links from the landing page for discovery
    const $ = cheerio.load(html);
    const navLinks = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim().substring(0, 60);
      if (href && (href.includes('/au/') || href.includes('gestionjuridica')) && text) {
        navLinks.push({ href, text });
      }
    });

    // Extract cases from the landing page first (/au/Users)
    let cases = extractFromTables($);

    // If none, try other routes
    if (cases.length === 0) {
      const routes = ['/au/procesos', '/au/casos', '/au/asignaciones', '/au/expedientes'];
      for (const route of routes) {
        try {
          const res = await instance.get(route, { headers: BROWSER_HEADERS });
          const followed = await followRedirects(res);
          if (followed.status === 200) {
            const $page = cheerio.load(followed.data);
            cases = extractFromTables($page);
            if (cases.length > 0) break;
          }
        } catch {
          continue;
        }
      }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        cases,
        navLinks: [...new Map(navLinks.map((l) => [l.href, l])).values()].slice(0, 30),
        message: cases.length > 0
          ? `Se encontraron ${cases.length} casos`
          : 'Sesión iniciada. Revisa navLinks para encontrar la ruta de casos.',
      }),
    };
  } catch (error) {
    return {
      statusCode: error.message.includes('Credenciales') ? 401 : 500,
      headers: CORS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function extractFromTables($) {
  const cases = [];

  $('table tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const rowData = [];
      cells.each((__, cell) => {
        rowData.push($(cell).text().trim());
      });

      cases.push({
        id: `case-${cases.length}`,
        radicado: rowData[0] || '',
        client: rowData[1] || '',
        type: rowData[2] || '',
        status: rowData[3]?.toLowerCase().includes('urgen') ? 'urgent' : 'active',
        professor: rowData[4] || '',
        raw: rowData,
      });
    }
  });

  if (cases.length === 0) {
    $('.card-body, .panel-body, .list-group-item').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20) {
        cases.push({
          id: `card-${cases.length}`,
          client: text.split('\n')[0]?.trim() || '',
          type: '',
          status: 'active',
          raw: [text.substring(0, 300)],
        });
      }
    });
  }

  return cases;
}
