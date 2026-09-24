# Web dev proxy config

`apps/web/proxy.config.js` is the webpack/Angular dev-server proxy used by
`nx serve web` and by the Playwright e2e static server (mirrored behavior).

## Target resolution

The API target is resolved at boot, in priority order:

1. `API_PROXY_URL` env var — lets the e2e suite point a web process at the
   isolated API (`http://localhost:3001`) without touching dev settings.
2. `IS_DOCKER` env var — dockerized web hits the compose service `http://api:3000`.
3. Fallback — local dev hits `http://localhost:3000`.

## Proxied paths

| Prefix | Notes |
|---|---|
| `/api` | REST API, `ws: true` for websockets |
| `/public` | Public static content |
| `/socket.io` | Realtime gateway, `ws: true` |
| `/uploads` | Uploaded files (resolved via `getUploadsFolderPath`) |

## E2E interplay

The web-e2e suite does not use the dev-server at all: its
`support/static-server.mjs` reproduces this proxying for the API paths so the
compiled Angular app gets identical routing semantics while avoiding the Nx
`web:serve:development` lock held by the developer's `nx serve web`.

## References

- `docs/web-e2e/testing.md` — why the static server replaces the dev-server in e2e runs.