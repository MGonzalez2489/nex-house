# ProfileEditPayload (web)

Typed, app-wide contract for a profile update coming out of the shared
`ProfileFormComponent`. It flows end-to-end through the user and onboarding
features (component → page → store → service) and is only converted into the
multipart `FormData` the API requires at the HTTP service boundary.

- **File:** `apps/web/src/app/_core/models/profile-edit-payload.ts`
- **Alias:** `@core/models/profile-edit-payload`

## `ProfileEditPayload`

```ts
interface ProfileEditPayload extends UpdateUserProfile {
  avatar?: File;
}
```

- Extends `UpdateUserProfile` (`@nexhouse/shared-domain/interfaces`), keeping
  parity with the API DTO: `firstName?`, `lastName?`, `phone?`.
- `avatar` stays **web-only** (`File`) so `shared-domain` remains free of DOM
  types; the API still receives the avatar as the multipart `avatar` file field.
- The component only adds keys that actually changed, so an **empty object**
  means the profile is already up to date and no request is needed.

## `toProfileFormData(payload): FormData`

Appends each present field to a `FormData`:

- `firstName`, `lastName`, `phone` — as text fields (only when defined).
- `avatar` — as the `avatar` file field (only when a `File` is present).

This is the single place that knows the multipart field names, so neither the
components nor the stores/services deal with `FormData` directly.

## Consumers

- `ProfileFormComponent` (emits the payload) — `apps/web/src/app/_shared/components/forms/profile-form-component/`
- `ProfileInfoForm` — `apps/web/src/app/features/user/components/profile-info-form/`
- `OnboardingGeneralComponent` — `apps/web/src/app/features/onboarding/components/general-component/`
- `UserStore.update` / `OnboardingStore.updateProfile`
- `ProfileService.update` / `OnboardingService.updateProfile` (build the `FormData`)