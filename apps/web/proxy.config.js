// Default dev target. E2E overrides it with `API_PROXY_URL` so the suite can
// run against an isolated API on a separate port without touching the dev one.
const API_TARGET =
  process.env.API_PROXY_URL ||
  (process.env.IS_DOCKER ? "http://api:3000" : "http://localhost:3000");

const PROXY_CONFIG = {
  "/api": {
    target: API_TARGET,
    secure: false,
    pathRewrite: {
      "^/api": "/api",
    },
    logLevel: "debug",
    ws: true,
  },
  "/public": {
    target: API_TARGET,
    secure: false,
  },
  "/socket.io": {
    target: API_TARGET,
    secure: false,
    ws: true,
  },
  "/uploads": {
    // Nueva configuración para rutas de archivos subidos
    target: API_TARGET,
    secure: false,
  },
};

module.exports = PROXY_CONFIG;
