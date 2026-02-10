import { login } from './lib/scraper.mjs';
import * as cheerio from 'cheerio';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BROWSER_HEADERS = {
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
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

    const { instance, followRedirects } = await login(username, password);

    // Fetch all pages in parallel
    const [tasksRes, consultasRes, procesosRes] = await Promise.all([
      instance.get('/au/Notification', { headers: BROWSER_HEADERS }).then((r) => followRedirects(r)),
      instance.get('/au/Consultas', { headers: BROWSER_HEADERS }).then((r) => followRedirects(r)),
      instance.get('/au/Procesos', { headers: BROWSER_HEADERS }).then((r) => followRedirects(r)),
    ]);

    const tasks = extractTasks(tasksRes.data || '');
    const consultas = extractConsultas(consultasRes.data || '');
    const procesos = extractProcesos(procesosRes.data || '');

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ tasks, consultas, procesos }),
    };
  } catch (error) {
    return {
      statusCode: error.message.includes('Credenciales') ? 401 : 500,
      headers: CORS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// ── Extract tasks from /au/Notification ──

function extractTasks(html) {
  const $ = cheerio.load(html);
  const tasks = [];

  $('.card.m-4').each((_, card) => {
    const $card = $(card);
    const header = $card.find('.card-header');
    const body = $card.find('.card-body');

    // Code and link (e.g. C2025091852171)
    const link = header.find('a[href*="/au/Editar"], a[href*="/au/Editapro"]');
    const code = link.find('strong').text().trim();
    const href = link.attr('href') || '';

    // Due date
    const dueDateText = header.find('small.text-secondary').text().trim().replace('Fecha de vencimiento: ', '');

    // Status badge
    const badges = [];
    header.find('.badge').each((__, badge) => {
      badges.push($(badge).text().trim());
    });
    const status = badges.join(' | ') || 'Sin resolver';

    // Task description
    const description = body.find('.card-text').text().trim();

    // Creation info
    const creationDate = body.find('p.m-0').first().text().trim().replace('Fecha de creacion: ', '');
    const createdBy = body.find('p.m-0').last().text().trim().replace('Creado por: ', '');

    // Responses
    const responses = [];
    body.find('.feed-activity-list .media-body').each((__, resp) => {
      const $resp = $(resp);
      const author = $resp.find('strong').first().text().trim();
      const date = $resp.find('small.text-muted').text().trim();
      const detail = $resp.find('strong:contains("Detalle:")').parent().text()
        .replace(/.*Detalle:\s*/, '').split('\n')[0].trim();
      const files = [];
      $resp.find('a[href*="show_file"]').each((___, file) => {
        files.push({ name: $(file).text().trim(), url: $(file).attr('href') });
      });
      if (author) responses.push({ author, date, detail, files });
    });

    if (code || description) {
      tasks.push({
        id: code,
        code,
        href,
        description,
        dueDate: dueDateText,
        creationDate,
        createdBy,
        status,
        resolved: status.toLowerCase().includes('resuelta'),
        responses,
      });
    }
  });

  return tasks;
}

// ── Extract consultas from /au/Consultas ──

function extractConsultas(html) {
  const $ = cheerio.load(html);
  const items = [];

  $('table tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const rowData = [];
      cells.each((__, cell) => {
        rowData.push($(cell).text().trim());
      });
      const link = $(row).find('a[href*="/au/Editar"]');
      items.push({
        id: `consulta-${items.length}`,
        raw: rowData,
        href: link.attr('href') || '',
        code: rowData[0] || '',
        client: rowData[1] || '',
        type: 'Consulta',
        status: rowData[rowData.length - 1] || '',
      });
    }
  });

  // Also try card-based layout
  if (items.length === 0) {
    $('.card').each((_, card) => {
      const $card = $(card);
      const link = $card.find('a[href*="/au/Editar"]');
      const code = link.find('strong').text().trim() || link.text().trim();
      const text = $card.find('.card-body, .card-text').text().trim();
      if (code) {
        items.push({
          id: `consulta-${items.length}`,
          code,
          href: link.attr('href') || '',
          description: text.substring(0, 300),
          type: 'Consulta',
        });
      }
    });
  }

  return items;
}

// ── Extract procesos from /au/Procesos ──

function extractProcesos(html) {
  const $ = cheerio.load(html);
  const items = [];

  $('table tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const rowData = [];
      cells.each((__, cell) => {
        rowData.push($(cell).text().trim());
      });
      const link = $(row).find('a[href*="/au/Editapro"]');
      items.push({
        id: `proceso-${items.length}`,
        raw: rowData,
        href: link.attr('href') || '',
        code: rowData[0] || '',
        client: rowData[1] || '',
        type: 'Proceso',
        status: rowData[rowData.length - 1] || '',
      });
    }
  });

  if (items.length === 0) {
    $('.card').each((_, card) => {
      const $card = $(card);
      const link = $card.find('a[href*="/au/Editapro"]');
      const code = link.find('strong').text().trim() || link.text().trim();
      const text = $card.find('.card-body, .card-text').text().trim();
      if (code) {
        items.push({
          id: `proceso-${items.length}`,
          code,
          href: link.attr('href') || '',
          description: text.substring(0, 300),
          type: 'Proceso',
        });
      }
    });
  }

  return items;
}
