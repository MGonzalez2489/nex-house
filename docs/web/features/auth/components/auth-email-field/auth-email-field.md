# AuthEmailField (web)

Presentational component that renders the email field shared by the auth pages.

- **File:** `apps/web/src/app/features/auth/components/auth-email-field/auth-email-field.ts`
- **Selector:** `app-auth-email-field`
- **Template:** `auth-email-field.html`
- **Scope:** auth feature (`features/auth/components/`); a pure presentational
  component with no store dependency.

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `control` | `FormControl<string>` (required) | — | Reactive form control bound with `[formControl]` |
| `label` | `string` | `'Correo Electrónico'` | Visible field label |
| `inputId` | `string` | `'email'` | `id` for the input; the error element uses `${inputId}-errors` |

## Accessibility

- `<label [for]="inputId()">` matches the input `id`.
- `autocomplete="email"` so browsers/password managers fill it correctly.
- `aria-invalid` mirrors `control.invalid && control.touched`.
- `aria-describedby` points at `${inputId}-errors` (the validation error host)
  only while the control is touched and invalid, fixing the previous mismatch
  where the input referenced `email-error` while the element id was
  `email-errors`.

## Notes

- The error `id` is derived with a `computed()` but the visible/touched state is
  evaluated inline in the template (`control().touched && control().errors`)
  because `FormControl.touched` is not a signal and would not invalidate a
  `computed`.
- Used by `LoginPage` and `PassRecoveryRequestPage`.

## Test coverage

- `apps/web/src/app/features/auth/components/auth-email-field/auth-email-field.spec.ts`
- Covers: creation, rendered email input (`type`, `id`, `autocomplete`) and the
  `aria-invalid`/`aria-describedby` linkage when invalid and touched.
