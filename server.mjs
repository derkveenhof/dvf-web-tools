import {createServer} from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import {extname, join, normalize} from 'node:path';
import myIpHandler from './api/my-ip.js';

const DIST_DIR = join(process.cwd(), 'dist');
const PORT = Number(process.env.PORT || 8080);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

function createVercelLikeResponse(res) {
  return {
    setHeader(name, value) {
      res.setHeader(name, value);
      return this;
    },
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(payload) {
      sendJson(res, res.statusCode || 200, payload);
      return this;
    },
  };
}

function sanitizePath(urlPath) {
  const normalized = normalize(urlPath).replace(/^([.][.][/\\])+/, '');
  return normalized.startsWith('/') ? normalized.slice(1) : normalized;
}

async function serveStatic(req, res) {
  const requestPath = new URL(req.url, 'http://localhost').pathname;
  const relativePath = sanitizePath(requestPath === '/' ? '/index.html' : requestPath);
  const absolutePath = join(DIST_DIR, relativePath);

  if (!absolutePath.startsWith(DIST_DIR)) {
    sendJson(res, 400, {error: 'Invalid path'});
    return;
  }

  try {
    const fileStat = await stat(absolutePath);
    if (fileStat.isFile()) {
      const extension = extname(absolutePath).toLowerCase();
      const contentType = MIME_TYPES[extension] || 'application/octet-stream';
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      createReadStream(absolutePath).pipe(res);
      return;
    }
  } catch {
    // Fall through to SPA fallback.
  }

  const indexPath = join(DIST_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    sendJson(res, 500, {error: 'Build output missing: dist/index.html'});
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  createReadStream(indexPath).pipe(res);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');

  if (url.pathname === '/api/my-ip') {
    try {
      myIpHandler(req, createVercelLikeResponse(res));
    } catch (error) {
      sendJson(res, 500, {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  await serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
