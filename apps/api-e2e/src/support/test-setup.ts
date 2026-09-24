import axios from 'axios';

module.exports = async function () {
  // The e2e suite talks to the isolated API on :3001 against `nexhouse_e2e`.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3001';
  axios.defaults.baseURL = `http://${host}:${port}`;
  axios.defaults.timeout = 15000;
  // Let specs inspect error envelopes (400/401/403/409/500) instead of throwing.
  axios.defaults.validateStatus = (status) => status >= 200 && status < 600;
};