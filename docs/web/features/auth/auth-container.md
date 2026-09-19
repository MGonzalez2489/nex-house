# AuthContainer (web)

Standalone shell component for every public auth route.

- **File:** `apps/web/src/app/features/auth/auth-container.ts`
- **Selector:** `app-auth-container`
- **Template:** `auth-container.html`
- **Routed:** `apps/web/src/app/features/auth/auth.routes.ts` (parent route,
  renders child pages through `<router-outlet />`).

## Layout

- Renders a semantic `<main>` landmark with `min-h-dvh` so the shell fills the
  viewport on mobile browsers (dynamic viewport height).
- Centres a `max-w-110` column holding `<app-brand-component>` and the
  `<router-outlet />` for the active auth page.

## Test coverage

- `apps/web/src/app/features/auth/auth-container.spec.ts`
- Covers: creation and the rendered `main` landmark, brand and outlet.

## Related

- Pages: `login-page`, `pass-recovery-request-page`, `pass-code-validate-page`,
  `pass-recovery-page`.
- Shared brand: `@shared/components` → `BrandComponent`.
