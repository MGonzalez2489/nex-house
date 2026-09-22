# OnboardingStore (web)

`@ngrx/signals` feature store that owns the onboarding wizard state
(`isCompleted`, `currentStepId`, `steps`) and the request methods each step
triggers. The wizard page (`OnboardingHomePage`) reads step/status state and
delegates every mutation to this store.

- **File:** `apps/web/src/app/features/onboarding/onboarding.store.ts`
- **Injected in:** `withDevtools('onboarding')`, `withReset()`, `withCallState()`.
- **Consumed by:** `onboarding-home-page`, `StartupStore`, `onboardingRequiredGuard`.

## State

| Field | Type | Description |
|---|---|---|
| `isCompleted()` | `boolean` | Whether the onboarding was finalized |
| `currentStepId()` | `OnboardingStepEnum` | Active wizard step |
| `steps()` | `OnboardingStepModel[]` | Wizard steps with completion flags |
| `loading()` / `loaded()` / `error()` | `CallState` | `withCallState` lifecycle signals |

## Methods

All methods `await` the service call, `patchState(..., setLoaded())` on success
and `setError` on failure (returning `Promise<boolean>`).

- `getStatus()` — via `OnboardingService.get()` (`GET /api/onboarding/status`).
- `changePassword(dto: ChangePassword)` — via
  `OnboardingService.changePassword()` (`PATCH /api/onboarding/security`); then
  reloads the user so `requirePwdChange` stays in sync.
- `updateProfile(dto: ProfileEditPayload)` — via
  `OnboardingService.updateProfile()` (`PATCH /api/onboarding/profile`). The
  typed diff payload is converted to multipart `FormData` by the service.
- `createUnit(dto: CreateUnit)` — via `OnboardingService.createUnit()`.
- `complete()` — via `OnboardingService.complete()`.

## Test coverage

- There is no dedicated store spec; the wizard request methods are exercised
  through `onboarding-home-page.spec.ts` (mocked store) and the component specs,
  with the underlying stores/services covered by their own suites.