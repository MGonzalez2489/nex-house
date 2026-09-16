# getClientIp

`getClientIp` is a small shared helper that resolves the effective client IP for
public endpoints in a single, consistent way.

- **File:** `apps/api/src/_core/utils/client-ip.util.ts`
- **Scope:** `@core/utils` (exported via the barrel `index.ts`)
- **Used by:** `AuthController` (login/refresh) and `PwdRecoveryController` (reset-password)

## Contract

`getClientIp(request: Request): string`

Resolution priority:

1. `request.ip` — the address Express resolved for the socket (honors the
   `trust proxy` setting when configured).
2. The **first entry** of the `X-Forwarded-For` header (when it is a string),
   trimmed. Proxies append the client IP as the first entry, so taking only the
   leading value avoids persisting a whole proxy chain (e.g.
   `"10.0.0.1, 172.16.0.1"`) into session metadata.
3. `0.0.0.0` when neither is available.

Non-string `X-Forwarded-For` values (e.g. arrays in some proxies) are ignored.

## Rationale

Before this helper, each controller inlined the fallback
`request.ip || request.headers['x-forwarded-for'] || '0.0.0.0'`:

- the comma-separated proxy chain was stored verbatim as the session IP;
- an array header value flow through the `||` unchanged;
- the logic was duplicated across handlers.

Centralizing it keeps session/IP metadata consistent across the whole
authentication lifecycle.

## Test coverage

- `apps/api/src/_core/utils/client-ip.util.spec.ts`
- Covers: `request.ip` priority; first `X-Forwarded-For` entry; whitespace
  trimming; non-string header ignored; `0.0.0.0` fallback (absent header and
  blank header).