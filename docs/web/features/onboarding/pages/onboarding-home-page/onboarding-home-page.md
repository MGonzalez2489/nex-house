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

- The whole page lives in a single centered column:
  `mx-auto w-full max-w-2xl px-4 sm:px-6 pb-24 lg:pb-6` — the exact container used
  by `resident-form-page` / `neigh-form-page`. On desktop the wizard occupies only
  the needed width (`max-w-2xl`, 672px) centered on screen with `pb-24 lg:pb-6`
  gutter at the bottom to clear the mobile nav bar.
- The header row (`logout` / `brand` / spacer) and the Optimus-UI stepper share
  this one container, so they stay aligned with the wizard instead of scrolling
  independently.
- Mobile-first: the container is `w-full` with `px-4 sm:px-6` horizontal padding,
  so nothing overflows the viewport. The stepper's own step-list scrolls
  horizontally (`overflow-x: auto`) and each step form collapses its grids
  (`grid-cols-1 md:grid-cols-*`) on small screens.
- No viewport-based widths/fixed pixel containers; the Optimus-UI stepper stacks
  its panel below the step list on small screens on its own.

## Navigation

- `currentStepId()` and `steps()` are `linkedSignal` derived from
  `OnboardingStore` — they reset whenever the store changes (e.g. after
  `load()`) but stay locally writable for manual step navigation. This replaced
  the previous effect that manually copied store signals into local `signal`s
  (a signals anti-pattern).
- `activeStepIndex()` computes the active `<p-step>` index from
  `steps()` + `currentStepId()` (single computed; the old duplicate
  `activeIndex` was removed).
- `goNext()` / `goBack()` move `currentStepId()` by one in `steps()`, guarding
  the array bounds (no-op at the wizard edges instead of reading
  `steps()[out-of-range]`).
- `finishWelcome()` marks the `welcome` step completed and advances.
- `completeOnboarding()` calls `store.complete()` and navigates to the dashboard on
  success.

## Skip-request rules

| Trigger | Behavior |
| --- | --- |
| `updateProfile(dto)` with an **empty** `ProfileEditPayload` | `ProfileFormComponent#preparePayload` only includes changed fields, so an empty payload means the profile already exists and is unchanged → `goNext()` **without** hitting the server. |
| `updateProfile(dto)` with entries | `store.updateProfile(dto)` then `userStore.loadProfile()`; the store advances `currentStepId()` via its response. |
| `createUnit(dto)` while `userStore.units().length > 0` | A unit is already assigned (e.g. revisiting the step) → `goNext()` **without** a creation request, avoiding duplicates. |
| `createUnit(dto)` with no units | `store.createUnit(dto)` then `userStore.loadUser()` to refresh the assigned units; the store advances the step. |

Empty-payload detection uses `Object.keys(dto).length > 0`.

## Test coverage

- `apps/web/src/app/features/onboarding/pages/onboarding-home-page/onboarding-home-page.spec.ts`
- The `updateProfile`/`createUnit` suites verify both the skip path (no store call,
  step advances) and the request path (store called). Store access is done through
  a `PageLike` cast of the component so no JSON requests are triggered.