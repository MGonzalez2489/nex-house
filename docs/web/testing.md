# Web testing setup (jest)

Unit-test configuration for `apps/web`. Mirrors the upstream
`jest-preset-angular` Angular 22 CJS preset.

## Files

| File | Purpose |
|---|---|
| `apps/web/jest.config.cts` | `jest-preset-angular` preset, esbuild transform for `ts`/`mjs`/`js`/`html`, `transformIgnorePatterns` allowing `.mjs` |
| `apps/web/tsconfig.spec.json` | TypeScript options used by the transformer in tests |
| `apps/web/src/test-setup.ts` | `setupZonelessTestEnv(...)` from `jest-preset-angular/setup-env/zoneless` |
| `package.json` → `test:web` | `nx test web` |

## Commands

- `npm run test:web` — full web unit suite.
- Forward jest args through `--`: `npm run test:web -- --testPathPatterns="features/auth"`.

## Critical: no `--experimental-vm-modules`

`jest-preset-angular` v17 with the CJS preset transforms **all** `.mjs`
(including `@angular/core`'s FESM bundles) to CommonJS via esbuild. If Node runs
jest with `--experimental-vm-modules`, jest loads those `.mjs` files as ESM and
evaluates the esbuild CJS output inside an ESM sandbox, producing
`ReferenceError: module is not defined` at `core.mjs:1:1`.

Therefore the flag is **API-only** (the API needs it for ESM-only `@nestjs/*`
packages). The web suite must run **without** it.

## `tsconfig.spec.json` requirements

| Option | Value | Why |
|---|---|---|
| `module` | `ES2022` | Matches the preset's expectation for the Angular 22 example app |
| `moduleResolution` | `Bundler` | Resolves Angular package exports |
| `target` | `es2022` | Native class fields / signals downleveling parity |
| `esModuleInterop` | `true` | Removes the ts-jest `TS151001` hint and keeps interop consistent |

Do not switch these back to `commonjs`/`node10`.

## Known pre-existing failures

None since the `should create` harnesses were fixed. The `features/auth` suite
(9 files, 56 tests) and the rest of the codebase (71 suites / 304 tests) all
pass. `form-validation-error.spec.ts` once showed a transient
`SIGSEGV` worker crash during a heavily parallel full run; it passes in
isolation and in repeated full runs, so treat any single-file crash of that
kind as an environment flake and re-run before investigating.

## References

- `AGENTS.md` → Commands / Known broken state.
- Upstream `jest-preset-angular` `examples/example-app-v22`.
