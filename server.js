// server.js — Session API for classroom mode (Le 5 Lenti)
// Uses only Node.js built-in modules — no extra dependencies needed.
import http from 'http';
import { randomBytes } from 'crypto';

const PORT = process.env.API_PORT || 3001;

// In-memory session store: Map<sessionId, Session>
// Session shape:
//   { id, situation, status: 'active'|'closed', submissions: [{ studentId, lenses, submittedAt }], createdAt }
const sessions = new Map();

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  try {
    // POST /api/sessions — formatore creates a session
    if (req.method === 'POST' && path === '/api/sessions') {
      const body = await readBody(req);
      const id = randomBytes(3).toString('hex').toUpperCase(); // e.g. "A3F9BC"
      sessions.set(id, {
        id,
        situation: (body.situation || '').trim(),
        status: 'active',
        submissions: [],
        createdAt: Date.now(),
      });
      return sendJson(res, 201, { id });
    }

    // GET /api/sessions/:id — get session state (trainer polls + student loads)
    if (req.method === 'GET' && /^\/api\/sessions\/[A-F0-9]{6}$/.test(path)) {
      const id = path.split('/').pop();
      const session = sessions.get(id);
      if (!session) return sendJson(res, 404, { error: 'Session not found' });
      return sendJson(res, 200, session);
    }

    // POST /api/sessions/:id/submit — student submits their lens answers
    if (req.method === 'POST' && /^\/api\/sessions\/[A-F0-9]{6}\/submit$/.test(path)) {
      const id = path.split('/')[3];
      const session = sessions.get(id);
      if (!session) return sendJson(res, 404, { error: 'Session not found' });
      if (session.status !== 'active') return sendJson(res, 410, { error: 'Session already closed' });
      const body = await readBody(req);
      const sub = { studentId: body.studentId, lenses: body.lenses, submittedAt: Date.now() };
      const idx = session.submissions.findIndex(s => s.studentId === body.studentId);
      if (idx >= 0) session.submissions[idx] = sub;
      else session.submissions.push(sub);
      return sendJson(res, 200, { ok: true });
    }

    // POST /api/sessions/:id/close — formatore closes the session
    if (req.method === 'POST' && /^\/api\/sessions\/[A-F0-9]{6}\/close$/.test(path)) {
      const id = path.split('/')[3];
      const session = sessions.get(id);
      if (!session) return sendJson(res, 404, { error: 'Session not found' });
      session.status = 'closed';
      return sendJson(res, 200, { ok: true, submissions: session.submissions.length });
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`[5 Lenti API] Session server running on port ${PORT}`);
});
