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

// ── Parse datax JavaScript variable from DataTables pages ──

function parseDatax(html) {
  const match = html.match(/const\s+datax\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').trim();
}

// ── Extract consultas from /au/Consultas ──

function extractConsultas(html) {
  const rows = parseDatax(html);
  if (rows && rows.length > 0) {
    return rows.map((cols, i) => {
      const code = stripHtml(cols[0]?.['data-order'] || cols[0]?.display || '');
      const clientRaw = cols[5]?.['data-order'] || cols[5]?.display || '';
      const client = stripHtml(clientRaw);
      const asesor = stripHtml(cols[3]?.['data-order'] || cols[3]?.display || '');
      const area = stripHtml(cols[4]?.['data-order'] || cols[4]?.display || '');
      const statusRaw = cols[7]?.['data-order'] || '';
      const statusDisplay = stripHtml(cols[7]?.display || '');
      const createdAt = stripHtml(cols[8]?.display || '');
      const updatedAt = stripHtml(cols[9]?.display || '');

      // Extract href from options column
      const hrefMatch = (cols[11]?.display || '').match(/href="([^"]*Editar[^"]*)"/);

      return {
        id: `consulta-${i}`,
        code,
        client,
        asesor,
        area,
        status: statusRaw || statusDisplay,
        statusDetail: statusDisplay,
        createdAt,
        updatedAt,
        href: hrefMatch ? hrefMatch[1] : '',
        type: 'Consulta',
      };
    });
  }

  // Fallback: try HTML table
  const $ = cheerio.load(html);
  const items = [];
  $('table tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const rowData = [];
      cells.each((__, cell) => rowData.push($(cell).text().trim()));
      const link = $(row).find('a[href*="/au/Editar"]');
      items.push({
        id: `consulta-${items.length}`,
        code: rowData[0] || '',
        client: rowData[5] || rowData[1] || '',
        status: rowData[7] || '',
        href: link.attr('href') || '',
        type: 'Consulta',
      });
    }
  });
  return items;
}

// ── Extract procesos from /au/Procesos ──

function extractProcesos(html) {
  const rows = parseDatax(html);
  if (rows && rows.length > 0) {
    return rows.map((cols, i) => {
      const code = stripHtml(cols[0]?.['data-order'] || cols[0]?.display || '');
      const radicado = stripHtml(cols[1]?.['data-order'] || '');
      const monitor = stripHtml(cols[2]?.['data-order'] || '');
      const asesor = stripHtml(cols[3]?.['data-order'] || '');
      const area = stripHtml(cols[4]?.['data-order'] || cols[4]?.display || '');
      const clientRaw = cols[5]?.['data-order'] || cols[5]?.display || '';
      const client = stripHtml(clientRaw);
      const contraparte = stripHtml(cols[6]?.['data-order'] || '');
      const statusRaw = cols[7]?.['data-order'] || '';
      const statusDisplay = stripHtml(cols[7]?.display || '');
      const createdAt = stripHtml(cols[8]?.display || '');
      const updatedAt = stripHtml(cols[9]?.display || '');

      const hrefMatch = (cols[11]?.display || '').match(/href="([^"]*Editapro[^"]*)"/);

      return {
        id: `proceso-${i}`,
        code,
        radicado,
        monitor,
        asesor,
        area,
        client,
        contraparte,
        status: statusRaw || statusDisplay,
        statusDetail: statusDisplay,
        createdAt,
        updatedAt,
        href: hrefMatch ? hrefMatch[1] : '',
        type: 'Proceso',
      };
    });
  }

  // Fallback: try HTML table
  const $ = cheerio.load(html);
  const items = [];
  $('table tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const rowData = [];
      cells.each((__, cell) => rowData.push($(cell).text().trim()));
      const link = $(row).find('a[href*="/au/Editapro"]');
      items.push({
        id: `proceso-${items.length}`,
        code: rowData[0] || '',
        client: rowData[5] || '',
        status: rowData[7] || '',
        href: link.attr('href') || '',
        type: 'Proceso',
      });
    }
  });
  return items;
}
