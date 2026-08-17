const PROXY_CONFIG = {
  "/api": {
    target: process.env.IS_DOCKER ? "http://api:3000" : "http://localhost:3000",
    secure: false,
    pathRewrite: {
      "^/api": "/api",
    },
    logLevel: "debug",
    ws: true,
  },
  "/public": {
    target: process.env.IS_DOCKER ? "http://api:3000" : "http://localhost:3000",
    secure: false,
  },
  "/socket.io": {
    target: process.env.IS_DOCKER ? "http://api:3000" : "http://localhost:3000",
    secure: false,
    ws: true,
  },
  "/uploads": {
    // Nueva configuración para rutas de archivos subidos
    target: process.env.IS_DOCKER ? "http://api:3000" : "http://localhost:3000",
    secure: false,
  },
};

module.exports = PROXY_CONFIG;
