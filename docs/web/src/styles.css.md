# styles.css (web)

Global stylesheet of the web app. Everything is Tailwind v4 (v4.3.3) plus a
handful of `@apply`-based component classes; there is no preprocessor and no
per-component CSS in the project.

- **File:** `apps/web/src/styles.css`
- **Imported by:** the global styles bundle configured in
  `apps/web/project.json` (`styles`) — Angular injects it once, before the app
  component.

## Contents

| Block                                            | Purpose                                                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `@import "tailwindcss" source("../src")`         | Tailwind entry point. `source()` pins the scanner to `apps/web/src` so only the app templates are scanned.                    |
| `@custom-variant dark (&:where(.dark, .dark *))` | Class-based dark mode: any `dark:` utility matches when the element is inside `.dark` (set by the theme service on `<html>`). |
| `@import "@openng/icons/openng-icons.css"`       | OpenNG icon font (used by the Optimus components).                                                                            |
| `@layer base`                                    | Default `border-color` for every element, so borders are `gray-200` without a utility.                                        |
| `.form-control`                                  | Field wrapper: vertical rhythm + the `.form-label` / `.required` rules.                                                       |

## `.form-control` / `.form-label` / `.required`

```css
.form-control {
  @apply mb-5; /* Espacio entre campos del formulario */

  .form-label {
    @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5;
  }

  .required:after {
    content: '*';
    @apply text-rose-500 font-bold ml-1;
  }
}
```

- `.form-control` is **nesting-scoped**: `.form-label` and `.required` only
  apply inside a `.form-control` wrapper. A `<label class="form-label">` placed
  outside one gets no styles at all (verified: the computed `color` falls back to
  the inherited value).
- `.required:after` appends the asterisk to the label's own `::after`, so
  `class="form-label required"` renders `Label *` with the asterisk in
  `rose-500`. It is a text glyph, not a `*`-prefixed `aria-label`, so assistive
  technology simply reads the label text; the required state is already exposed
  by the control's own validation.

### The label is level 3 of the type scale

`text-sm font-medium` is deliberately **one step below** the section title
(`text-base font-semibold`, see `docs/web/_shared/components/nex-card/nex-card.md`)
and one step above the hint copy (`text-xs text-slate-500`). Two rules were
removed/changed here to make that step visible:

- **`tracking-wider` was dropped.** At 14px the extra letter-spacing made the
  label read like a small-caps _eyebrow_ — the same register as a section title —
  which is exactly what collapsed the hierarchy between the card header and the
  field labels.
- **`text-slate-600` → `text-slate-700`, and `dark:text-slate-300` was added.**
  `slate-600` measured **2.9:1** on the dark surface (`slate-900`) — well below
  the WCAG AA 4.5:1 floor — and the rule had no dark variant at all. The label is
  the only thing that tells the user which control is which, so it now measures
  10.4:1 in light and 12.0:1 in dark.

## Layer order with the Optimus UI stylesheets

`@import "tailwindcss"` declares `@layer theme, base, components, utilities`.
The Optimus engine injects its own `@layer theme, base, optimus` **before** this
stylesheet in `<head>`, so the effective order is
`theme, base, optimus, components, utilities` and Tailwind utilities beat the
component theme. This is what makes every `pt` override in `app-nex-card` work.
**Do not remove `cssLayer` from `provideOptimus` in `app.config.ts`** — see
`docs/web/_shared/components/nex-card/nex-card.md`.

## Editing notes

- The class is applied with `@apply`, so a utility that is misspelled fails
  silently: verify a new declaration in the compiled CSS
  (`@tailwindcss/postcss` on this file prints the real output) or in the browser.
- The dark variant inside `@apply` (`dark:text-slate-300`) compiles to native
  nesting (`&:where(.dark, .dark *)`) and works because the `@custom-variant`
  above is declared in the same file.
- Global overrides and theme extensions belong in
  `apps/web/src/app/theme/`, not here; this file only holds app-wide defaults.
