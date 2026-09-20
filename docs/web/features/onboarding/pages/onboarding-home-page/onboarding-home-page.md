# OnboardingHomePage (web)

Main page of the onboarding wizard shown to pending users (`/onboarding`). It
renders an Optimus-UI stepper whose panels map one-to-one to the steps returned
by `OnboardingStore` and coordinates navigation plus the "skip when nothing
changed" optimization.

- **File:** `apps/web/src/app/features/onboarding/pages/onboarding-home-page/onboarding-home-page.ts`
- **Template:** `onboarding-home-page.html`
- **Route:** `apps/web/src/app/features/onboarding/onboarding.routes.ts`, resolved by
  `loadResolver` before the component loads.

## Stores

- `OnboardingStore` — wizard state: `currentStepId()`, `steps()`, request methods.
- `UserStore` — user, profile, role and assigned `units()` used by the panels.
- `ContextStore` / `CatalogsStore` — street, unit-type and unit-role catalog options
  for the unit step.

## Step panels (template)

- `welcome` → `OnboardingWelcomeComponent`; `(next)="finishWelcome()"`.
- `security` → `OnboardingPwdChangeComponent`; `(doSubmit)="changePwd($event)"`.
- `general-form` → `OnboardingGeneralComponent`; `(doSubmit)="updateProfile($event)"`.
- `create-unit` → `OnboardingUnitComponent`; `(doSubmit)="createUnit($event)"`.
- `complete` → `OnboardingFinishComponent`, receives `profile`, `user`, `role` and
  `units`; `(complete)="completeOnboarding()"`.
- The header row offers logout (`SessionService.logout()`) and the `BrandComponent`.
- The `security`, `general-form` and `create-unit` steps receive
  `[callState]="store.callState()"` so `FormOptions` inside each step renders server
  errors via `FormFeedback` after a failed request.

## Responsive (mobile-first) layout

- Outer wrappers are `w-full` with `px-4 sm:px-6` horizontal padding; the header
  row caps at `max-w-210` (≈840px) instead of a fixed `w-210`, so the wizard fits
  any viewport without being clipped.
- No viewport-based widths/fixed pixel containers; the Optimus-UI stepper stacks
  its panel below the step list on small screens on its own.

## Navigation

- `activeIndex()` / `activeStepIndex()` compute the active `<p-step>` index from
  `steps()` + `currentStepId()`.
- `goNext()` / `goBack()` move `currentStepId()` by one in `steps()`.
- `finishWelcome()` marks the `welcome` step completed and advances.
- `completeOnboarding()` calls `store.complete()` and navigates to the dashboard on
  success.

## Skip-request rules

| Trigger | Behavior |
| --- | --- |
| `updateProfile(dto)` with an **empty** `FormData` | `ProfileFormComponent#preparePayload` only appends changed fields, so an empty payload means the profile already exists and is unchanged → `goNext()` **without** hitting the server. |
| `updateProfile(dto)` with entries | `store.updateProfile(dto)` then `userStore.loadProfile()`; the store advances `currentStepId()` via its response. |
| `createUnit(dto)` while `userStore.units().length > 0` | A unit is already assigned (e.g. revisiting the step) → `goNext()` **without** a creation request, avoiding duplicates. |
| `createUnit(dto)` with no units | `store.createUnit(dto)` then `userStore.loadUser()` to refresh the assigned units; the store advances the step. |

Empty-payload detection uses `Array.from(dto.keys()).length > 0`.

## Test coverage

- `apps/web/src/app/features/onboarding/pages/onboarding-home-page/onboarding-home-page.spec.ts`
- The `updateProfile`/`createUnit` suites verify both the skip path (no store call,
  step advances) and the request path (store called). Store access is done through
  a `PageLike` cast of the component so no JSON requests are triggered.