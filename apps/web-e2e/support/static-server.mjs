/**
 * Minimal static server used by the web-e2e suite.
 *
 * Serves the built Angular app (`dist/apps/web/browser`) and proxies API/S3
 * upload/socket paths to the e2e API, mirroring `apps/web/proxy.config.js`.
 * It does not depend on the Nx dev-server, so it can run in parallel with the
 * developer's `nx serve web` (which holds the `web:serve:development` Nx lock).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env['WEB_E2E_PORT'] || '4288');
const ROOT = path.resolve(process.env['WEB_E2E_DIST'] || 'dist/apps/web/browser');
const BACKEND = new URL(process.env['API_E2E_BACKEND'] || 'http://127.0.0.1:3001');

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

const PROXIED_PREFIXES = ['/api', '/public', '/uploads', '/socket.io'];

const proxyToApi = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const headers = { ...req.headers, host: BACKEND.host };
  const proxyReq = http.request(
    {
      host: BACKEND.hostname,
      port: BACKEND.port,
      method: req.method,
      path: `${url.pathname}${url.search}`,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`[web-e2e] proxy error: ${err.message}`);
  });
  req.pipe(proxyReq);
};

const serveFile = (res, filePath) => {
  const type = MIME[path.extname(filePath)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (PROXIED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return proxyToApi(req, res);
  }

  const filePath = path.join(ROOT, url.pathname === '/' ? 'index.html' : url.pathname);
  try {
    if (fs.statSync(filePath).isFile()) {
      return serveFile(res, filePath);
    }
  } catch {
    // fall through to the SPA fallback
  }

  const index = path.join(ROOT, 'index.html');
  try {
    serveFile(res, index);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`[web-e2e] missing ${index}: build the web app first (${err.message})`);
  }
});

server.listen(PORT, () => {
  console.log(`[web-e2e] static server on http://localhost:${PORT} (root ${ROOT})`);
});