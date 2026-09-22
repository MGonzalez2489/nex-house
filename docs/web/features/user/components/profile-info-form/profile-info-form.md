# ProfileInfoForm (web)

Editable panel for the user's personal information. Composes the shared
`ProfileFormComponent` (avatar + `firstName`/`lastName`/`phone` reactive form)
and `FormOptions` inside an Optimus `p-panel`. The `save` output carries the
typed `ProfileEditPayload` (only changed fields); the multipart `FormData` that
the API expects is built later by `ProfileService.update` via
`toProfileFormData`.

- **File:** `apps/web/src/app/features/user/components/profile-info-form/profile-info-form.ts`
- **Template:** `profile-info-form.html` (standalone, `OnPush`)

## Inputs / Outputs

| Direction | Name | Type | Description |
|---|---|---|---|
| Input | `user` | required `UserModel` | Used to render the read-only email |
| Input | `profile` | required `UserProfileModel` | Source for the shared profile form |
| Input | `isLoading` | required `boolean` | Saving state forwarded to `FormOptions` |
| Input | `callState` | `CallState` | Save lifecycle forwarded to `FormOptions` (renders `FormFeedback` on error) |
| Output | `save` | `ProfileEditPayload` | Emits the typed, diffed payload from the shared form on submit |

## Behavior

- Two internal modes: `"info"` (default, read-only display) and `"form"`
  (editing). The pencil `p-button` in the panel header switches to editing; the
  `doCancel` from `FormOptions` returns to `"info"`.
- **Cancel discards unsaved edits:** `cancel()` sets mode back to `"info"` and
  bumps a `resyncKey` signal bound to the shared form, so the text fields revert
  to the `profile` values and any freshly-uploaded avatar is cleared — the
  preview falls back to the original stored avatar (or the placeholder).
- The email is rendered as a **disabled** one-way `[value]` input. The old
  `[(ngModel)]="user().email"` two-way binding (which wrote back into the store's
  user object) was removed together with the `FormsModule` import.
- After a successful save the panel auto-returns to read mode: an `effect`
  watches `callState`; while in `"form"` mode it remembers a `"loading"`
  transition and only when it later reaches `"loaded"` flips back to `"info"`.
  On save errors the panel stays in edit mode so the user can retry.

## Test coverage

- `apps/web/src/app/features/user/components/profile-info-form/profile-info-form.spec.ts`
- Covers: email read-only rendering, node mode toggling (edit/cancel), save
  passthrough, `resyncKey` bump on cancel, auto-return to read mode after a
  successful save, and staying in edit mode on failure. Shared app components
  and Optimus primitives are stubbed via `overrideComponent`.