# OnboardingHomePage (web)

Main page of the onboarding wizard shown to pending users (`/onboarding`). It
renders an Optimus-UI stepper whose panels map one-to-one to the steps returned
by `OnboardingStore` and coordinates navigation plus the "skip when nothing
changed" optimization. The wizard is **linear and non-navigable**: there is no
clickable step header, only a read-only "Paso X de Y" progress indicator.

- **File:** `apps/web/src/app/features/onboarding/pages/onboarding-home-page/onboarding-home-page.ts`
- **Template:** `onboarding-home-page.html`
- **Route:** `apps/web/src/app/features/onboarding/onboarding.routes.ts`, resolved by
  `loadResolver` before the component loads.

## Stores

- `OnboardingStore` — wizard state: `currentStepId()`, `steps()`, request methods.
- `UserStore` — user, profile, role and assigned `units()` used by the panels.
- `ContextStore` / `CatalogsStore` — street, unit-type and unit-role catalog options
  for the unit step.

## Step progress (replaces the step list)

The Optimus-UI `<p-step-list>` / `<p-step>` block was **removed**. Those headers
were interactive tabs, so they let a user jump to any step (including future,
incomplete ones) and bypass the required data the API tracks. The stepper is now
driven exclusively by `goNext()` / `goBack()` from the step forms.

In its place the page renders a read-only indicator, wrapped in
`<section aria-label="Progreso del registro">` and only when at least one step
is known:

| Element | Source | Notes |
| --- | --- | --- |
| `Paso {{ currentStepNumber() }} de {{ totalSteps() }}` | `currentStepNumber()` / `totalSteps()` | 1-based counter. `currentStepNumber()` is `0` while `steps()` is empty, so the whole block is hidden instead of showing `Paso 0 de 0`. |
| `{{ currentStepLabel() }}` | `currentStepLabel()` | Label of the **current** step only (server-provided, Spanish), rendered with `truncate` so long labels never overflow. Rendered only when non-empty. |
| `<p-progressbar [value]="progressPercent()">` | `progressPercent()` | `Math.round(currentStepNumber() / totalSteps() * 100)`, `0` when there are no steps. `ProgressBarModule` is imported for this; the component sets `role="progressbar"` / `aria-valuenow` itself, so only an `aria-label` is added. |

All four are `computed()` derived from `steps()` + `activeStepIndex()`, so they
update automatically on `goNext()`, `goBack()` and on every store response
(`load`, `changePassword`, `updateProfile`, `createUnit`, `complete`).

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
- `<p-stepper>` / `<p-step-panels>` / `<p-step-panel>` are kept because a
  `p-step-panel` renders its content only when its `value` equals the stepper's
  `value`. Without a `p-step-list` the stepper has no `stepItems`, which makes
  `StepPanel#isVertical()` false and disables the panel transition — panels
  still swap correctly, just without the slide animation.

## Responsive (mobile-first) layout

- The whole page lives in a single centered column:
  `mx-auto w-full max-w-2xl px-4 sm:px-6 pb-24 lg:pb-6` — the exact container used
  by `resident-form-page` / `neigh-form-page`. On desktop the wizard occupies only
  the needed width (`max-w-2xl`, 672px) centered on screen with `pb-24 lg:pb-6`
  gutter at the bottom to clear the mobile nav bar.
- The header row (`logout` / `brand` / spacer), the progress indicator and the
  Optimus-UI stepper share this one container, so they stay aligned with the
  wizard instead of scrolling independently.
- The progress header is a `flex items-center justify-between gap-4` row, so the
  counter sits left and the step label right on every breakpoint; the label
  truncates rather than wrapping, and the row collapses vertically on narrow
  viewports.
- Mobile-first: the container is `w-full` with `px-4 sm:px-6` horizontal padding,
  so nothing overflows the viewport. Each step form collapses its grids
  (`grid-cols-1 md:grid-cols-*`) on small screens. Removing `p-step-list` also
  removes the horizontally scrolling step header, so the page no longer has a
  horizontal scroll container.
- No viewport-based widths/fixed pixel containers; the Optimus-UI stepper stacks
  its panel below the step list on small screens on its own.

## Navigation

- `currentStepId()` and `steps()` are `linkedSignal` derived from
  `OnboardingStore` — they reset whenever the store changes (e.g. after
  `load()`) but stay locally writable for manual step navigation. This replaced
  the previous effect that manually copied store signals into local `signal`s
  (a signals anti-pattern).
- `activeStepIndex()` computes the active `<p-step-panel>` index from
  `steps()` + `currentStepId()` (single computed; the old duplicate
  `activeIndex` was removed). It is still bound to `<p-stepper [value]>` to
  decide which panel is shown.
- `goNext()` / `goBack()` move `currentStepId()` by one in `steps()`, guarding
  the array bounds (no-op at the wizard edges instead of reading
  `steps()[out-of-range]`). These are the **only** ways the wizard advances
  now that the step headers are gone.
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
- The `step progress` suite covers the new indicator: hidden while `steps()` is
  empty, `Paso 3 de 5` + the step label + `60`% for the middle of a 5-step
  wizard, recomputation after `goNext()`, and the `0`/`0`/`0`/`''` fallback
  values with no steps. One test asserts the navigation is really gone
  (`p-step-list` / `p-step` absent while all 5 `p-step-panel`s remain).
- The `updateProfile`/`createUnit` suites verify both the skip path (no store call,
  step advances) and the request path (store called). Store access is done through
  a `PageLike` cast of the component so no JSON requests are triggered.