# ProfileFormComponent (web)

Shared, signal-first reactive form for the user's personal profile: avatar
upload with preview + `firstName` / `lastName` / `phone` text fields. Used by the
profile page (`ProfileInfoForm`) and the onboarding wizard
(`OnboardingGeneralComponent`).

- **File:** `apps/web/src/app/_shared/components/forms/profile-form-component/profile-form-component.ts`
- **Template:** `profile-form-component.html` (standalone, `OnPush`)
- **Exported through:** `@shared/components/forms`

## Inputs / Outputs

| Direction | Name | Type | Description |
|---|---|---|---|
| Input | `profile` | `UserProfileModel` | Pre-fills the form and drives the avatar preview |
| Input | `disabledForm` | `boolean` | Disables every control (including the avatar trigger) when truthy |
| Input | `resyncKey` | `number` | Re-syncs the whole form to `profile` every time it changes, discarding unsaved edits (used by parents on cancel/back) |
| Output | `doSubmit` | `ProfileEditPayload` | Typed diff payload (changed fields only) on valid submit |

## Form model

Strictly typed `FormGroup<ProfileForm>` with `firstName`/`phone` `required`, and
`avatar` as `FormControl<File | null>`. `formChanges` is a `toSignal` over
`valueChanges`, which is the only sanctioned RxJS→signal interop in the component.

## Behavior

- **Avatar trigger:** the circular button opens the file chooser through a native
  `#avatarInput` (`<input type="file" accept="image/*">` with `class="hidden"`)
  referenced via `viewChild<ElementRef<HTMLInputElement>>`→ `click()` on tap. This
  replaced the previous `viewChild.required(FileUpload)` → `choose()` approach
  (a hidden Optimus `FileUpload` advanced widget), which depended on the Optimus
  internals and its own CSS cascade (`pt-root 'hidden'`) to keep the widget
  invisible — unreliable in the real browser, where the programmatic picker never
  opened. The native input opens the picker deterministically inside the user
  gesture. A `disabledForm()` guard short-circuits `onChoose()` and the input
  also carries `[disabled]`.
- **Choice handling:** `onAvatarInputChange(event)` reads `event.target.files`,
  writes the `File` into the `avatar` control and clears `input.value` so the
  same file can be re-selected. Because Angular's signal-based forms no longer
  mark a control dirty on programmatic `setValue`, the handler explicitly calls
  `markAsDirty()` — the dirty flag is what decides avatar inclusion in the
  payload.
- **Preview lifecycle:** an `effect` watches the avatar value through
  `formChanges`; it **revokes the previous object URL before creating the next**
  and clears the preview when the file is removed. The URL is also revoked on
  destroy. `previewUrl` is a `computed` that falls back to `profile()?.avatar?.url`
  when no file is uploaded, so the original stored avatar (or the placeholder
  icon) is shown until the user actually replaces it.
- **Re-sync (cancel):** an `effect` reacts to `resyncKey`/`profile` changes and
  patches the text fields back to the `profile` values while resetting the
  `avatar` control to `null` (pristine). Combined with the computed preview,
  cancelling an edit restores the original avatar preview — the stored one if
  it exists, otherwise the user placeholder — and discards the unsaved upload.
- **Disabled state:** an `effect` follows `disabledForm()` and toggles
  `form.disable()/enable()`.
- **Submit:** `onSubmit()` marks controls touched and bails early when invalid.
  `preparePayload()` diffs the raw values against the `profile` input and emits a
  `ProfileEditPayload` containing **only the changed keys**; the avatar is
  included only when it is a `File` **and** the control is dirty (i.e. only when
  the user actually selected a new one — the original is preserved serverside).
  The `FormData` the API consumes is built later by the feature service
  (`toProfileFormData`).

## Accessibility

- The avatar is a single native `<button>` (keyboard-operable, `disabled`
  aware) labelled "Subir foto de perfil" and described by `#avatar-hint`; the
  focus ring (`focus-visible:outline-*) is drawn as a rounded-full outline
  around the whole button.
- The preview uses Angular 22 template idioms: a single `[class]` binding derived
  from `previewUrl()` (adds the flex centering classes only while showing the
  placeholder) and an `@let preview = previewUrl()` alias so the computed value
  is read once per render.
- Error IDs are centralized (`firstName-errors`, `lastName-errors`,
  `phone-errors`) and bound on **both** `[attr.aria-describedby]` and the
  matching `<app-form-validation-error id>` — fixing the previous
  `firstName-error`/`firstName-errors` mismatch.
- `aria-invalid` mirrors the `invalid && touched` state of every control.
- Fields use `autocomplete` hints (`given-name`, `family-name`, `tel`) and the
  `required` label underscore from the global `.form-label.required` rule.
- The phone keeps the `(999)-999-9999` mask; the duplicate `placeholder`
  attribute was removed (single `(614)-123-4567` placeholder).

## Responsive (mobile-first)

- Avatar circle scales `h-24 w-24` → `sm:h-32 sm:w-32` → `md:h-36 md:w-36`, with
  a camera badge overlapped on the bottom-right edge and a focus-visible cyan
  outline. The circle is an inner `span` (`overflow-hidden rounded-full`) that
  clips the image/icon, so the badge is never cut by the button — it sits
  half-overlapping the dashed border (standard avatar-edit pattern) and scales
  on hover.
- Layout uses the global `.form-control`/`.form-label` utilities and
  `space-y-6`; fields are full-width and stack naturally on small screens.

## Related

- `ProfileEditPayload` / `toProfileFormData` — `docs/web/_core/models/profile-edit-payload.md`
- `FormValidationErrorComponent` — `docs/web/_shared/components/forms/form-validation-error/form-validation-error.md`

## Test coverage

- `apps/web/src/app/_shared/components/forms/profile-form-component/profile-form-component.spec.ts`
- Uses the real component with a native `input[type=file]` (no Optimus stubs;
  file selection is simulated by setting `input.files` via
  `Object.defineProperty` and dispatching a `change` event; URL
  `create/revokeObjectURL` are mocked). Covers: required labels/controls,
  invalid-submit blocking, diffed payload emission (with and without a source
  profile), avatar inclusion when dirty / exclusion when pristine, preview
  creation + object-URL revocation, the native chooser opening on click and NOT
  opening while disabled, disabledForm behavior, profile pre-fill incl. the
  stored-avatar preview fallback, `resyncKey` reverting to the original avatar /
  placeholder icon, and the aria-invalid/aria-describedby wiring.