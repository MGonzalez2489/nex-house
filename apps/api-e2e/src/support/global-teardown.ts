import { killPort } from '@nx/node/utils';

module.exports = async function () {
  // Stop the e2e API. Only the e2e port (3001) is touched, never the dev API
  // on 3000.
  const port = Number(process.env.PORT ?? '3001');
  try {
    await killPort(port);
  } catch {
    console.warn(
      `[api-e2e] No process was listening on port ${port} during teardown; skipping.`,
    );
  }
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};