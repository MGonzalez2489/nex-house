const PROXY_CONFIG = {
  '/api': {
    target: process.env.IS_DOCKER ? 'http://api:3000' : 'http://localhost:3000',
    secure: false,
    pathRewrite: {
      '^/api': '/api',
    },
    logLevel: 'debug',
  },
};

module.exports = PROXY_CONFIG;
