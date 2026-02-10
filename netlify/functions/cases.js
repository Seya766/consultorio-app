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
        body: JSON.stringify({ error: 'Credenciales requeridas' }),
      };
    }

    const session = await login(username, password);

    // Fetch the cases/processes page
    // Common Laravel routes for this type of app:
    // /au/procesos, /au/casos, /au/asignaciones, /au/home
    // We'll try multiple possible routes
    const possibleRoutes = ['/au/procesos', '/au/casos', '/au/asignaciones', '/au/home'];
    let casesHtml = '';
    let successRoute = '';

    for (const route of possibleRoutes) {
      try {
        const response = await session.get(route);
        if (response.status === 200 && response.data.length > 500) {
          casesHtml = response.data;
          successRoute = route;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!casesHtml) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          cases: [],
          message: 'Sesión iniciada pero no se encontraron las rutas de casos. Revisa las rutas internas de la plataforma.',
          debug: { triedRoutes: possibleRoutes },
        }),
      };
    }

    const $ = cheerio.load(casesHtml);
    const cases = [];

    // Extract navigation links for debugging (helps find the right routes)
    const navLinks = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && href.includes('/au/') && text) {
        navLinks.push({ href, text: text.substring(0, 50) });
      }
    });

    // Try to find cases in tables (most common format for Laravel CRUD apps)
    $('table tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 3) {
        const rowData = [];
        cells.each((__, cell) => {
          rowData.push($(cell).text().trim());
        });

        cases.push({
          id: rowData[0] || `case-${Date.now()}-${cases.length}`,
          radicado: rowData[0] || '',
          client: rowData[1] || '',
          type: rowData[2] || '',
          status: rowData[3] || 'active',
          professor: rowData[4] || '',
          raw: rowData,
        });
      }
    });

    // Also try card-based layouts
    if (cases.length === 0) {
      $('.card, .panel, .list-group-item, .proceso, .caso').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 10) {
          cases.push({
            id: `card-${cases.length}`,
            raw: text.substring(0, 200),
            client: text.split('\n')[0]?.trim() || '',
            type: '',
            status: 'active',
          });
        }
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        cases,
        route: successRoute,
        navLinks: navLinks.slice(0, 20),
        message: cases.length > 0
          ? `Se encontraron ${cases.length} casos`
          : 'Página cargada pero no se detectaron casos en el formato esperado. Revisa navLinks para encontrar la ruta correcta.',
      }),
    };
  } catch (error) {
    return {
      statusCode: error.message.includes('Credenciales') ? 401 : 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
