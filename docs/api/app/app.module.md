# App module (environment switch)

`apps/api/src/app/app.module.ts` is the API root module. It wires the global
JWT guard, the neighborhood-scope interceptor, TypeORM, static uploads,
catalog/session caching and every domain module.

## E2E environment

The module selects the env file based on a dedicated flag:

```ts
envFilePath: process.env.NX_E2E === '1' ? '.env.e2e' : '.env',
```

When the e2e suites boot the API (`NX_E2E=1 NODE_ENV=test PORT=3001`), the
process reads `.env.e2e` (gitignored, template `.env.e2e.example`) instead of
the developer's `.env`, isolating it to:

- schema `nexhouse_e2e` (host DB port `3307`, user `pAdmin`, password `1234`),
- `CLIENT_URL=http://localhost:4288` (web-e2e origin),
- dedicated `JWT_SECRET` / `JWT_RESET` values,
- `USE_REDIS=false` (no external cache dependency),
- seeded super admin `root@test.com` / `1234`.

Because non-production is detected from `NODE_ENV`, new users/admin fixtures
keep the default dev password `1234`, which the suites rely on.

## References

- `docs/api-e2e/testing.md` — echo system the switch participates in.
- `docs/database-schema.md` — entities and sync behavior.