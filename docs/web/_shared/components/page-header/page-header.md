# PageHeader (web)

Standardised page title section used by every routed page. It renders the page
`<h1>`, an optional `subTitle` that is hidden below the `sm` breakpoint, and a
content-projection area for the page actions (buttons, menus, filters).

- **File:** `apps/web/src/app/_shared/components/page-header/page-header.ts`
- **Template:** `page-header.html` (standalone, `OnPush`, signal inputs)
- **Selector:** `app-page-header`
- Exported from the shared barrel `apps/web/src/app/_shared/components/index.ts`.

## API

| Input      | Type     | Required | Description                        |
| ---------- | -------- | -------- | ---------------------------------- |
| `title`    | `string` | ✅ yes   | Rendered as the page `<h1>`.       |
| `subTitle` | `string` | no       | Supporting copy. Hidden on mobile. |

| Slot                           | Description                                                                                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _(default content projection)_ | Page actions. Rendered in a trailing, `shrink-0` flex row beside the title. When nothing is projected the row is removed from the layout and the title gets the full width. |

There are no named slots and no outputs. A chip/badge next to the title is
**not** supported: render it from the consuming page if needed.

### Required title

`title` is `input.required<string>()`. Omitting it does not fail silently —
reading it in the template throws `NG0950: Input is required but no value is
available yet`, which surfaces as a runtime error in the console. This is
asserted in the unit tests.

## Template

```html
<header class="flex items-center justify-between gap-3">
  <div
    class="min-w-0 max-sm:has-[~.page-header-actions:not(:empty)]:max-w-1/2 sm:max-w-none"
  >
    <h1
      class="truncate font-display text-xl font-semibold text-slate-900 sm:whitespace-normal sm:text-2xl dark:text-white"
    >
      {{ title() }}
    </h1>

    @if (subTitle()) {
    <p class="mt-1 hidden text-sm text-slate-500 sm:block dark:text-slate-400">
      {{ subTitle() }}
    </p>
    }
  </div>

  <div
    class="page-header-actions empty:hidden flex shrink-0 items-center gap-3"
  >
    <ng-content />
  </div>
</header>
```

## Behavior

- **Semantic markup.** The root is a `<header>` element and the title is a real
  `<h1>`, so every page keeps exactly one top-level heading.
- **Subtitle hidden on mobile.** `hidden sm:block` hides the supporting copy
  below the `sm` breakpoint (640px) to keep the mobile header compact. It stays
  in the DOM — it is only visually hidden.
- **Subtitle is optional.** The `<p>` is only created when `subTitle()` is truthy,
  so an omitted _or_ empty-string subtitle renders no element at all.
- **Title and actions always share one row.** The header is a single
  `flex items-center justify-between` row on **every** viewport — including
  mobile — so projected actions always sit on the opposite side of the title
  instead of stacking underneath it.
- **The title yields space, the actions never do.** The title block is
  content-sized (`min-w-0`, no `flex-1`/`grow`/`w-full`) and the actions wrapper is
  `shrink-0`, keeping its natural width. The result: `justify-between` can always
  push the actions to the trailing edge.
- **The half-screen cap only applies while there are actions.** Below `sm` the
  title block is capped with
  `max-sm:has-[~.page-header-actions:not(:empty)]:max-w-1/2`. When a page projects
  nothing, the wrapper is `:empty` → `display: none` and the selector does not
  match, so **no `max-width` is applied at all** and the title may use the full
  width before truncating. Angular exposes no way to query "is anything
  projected?", so this is done in CSS with the `page-header-actions` hook class on
  the wrapper plus a `:has(~ … :not(:empty))` sibling selector. The `max-sm:`
  wrapper keeps the cap and the unconditional `sm:max-w-none` inside mutually
  exclusive media queries, so the two can never fight over `max-width`
  regardless of utility order in the stylesheet.
- **Long titles truncate on mobile.** The `<h1>` uses `truncate`
  (`overflow-hidden text-ellipsis whitespace-nowrap`), so an over-long title ends
  in an ellipsis — at the 50% mark when actions are projected, at the screen edge
  when they are not — rather than pushing the actions off-screen. From `sm` up,
  `sm:whitespace-normal` restores wrapping and `sm:max-w-none` keeps the block
  uncapped, giving desktop titles the room they need.
- **No horizontal overflow.** Verified in headless Chromium against the compiled
  stylesheet at 375px and 1280px:

  | Viewport | Title                                | Actions   | Title block      | Truncated          | Actions         | X overflow |
  | -------- | ------------------------------------ | --------- | ---------------- | ------------------ | --------------- | ---------- |
  | 375px    | `Unidades`                           | –         | content-sized    | no                 | `display: none` | none       |
  | 375px    | 560px-long title                     | 2 buttons | 188px (**50%**)  | **yes** (ellipsis) | trailing edge   | none       |
  | 375px    | 560px-long title                     | –         | 375px (**100%**) | yes (at the edge)  | `display: none` | none       |
  | 375px    | `Administracion de fraccionamientos` | 1 button  | 188px (**50%**)  | **yes** (ellipsis) | trailing edge   | none       |
  | 375px    | `Administracion de fraccionamientos` | –         | 310px (83%)      | no                 | `display: none` | none       |
  | 1280px   | 560px-long title                     | 2 buttons | 1165px (91%)     | no (wraps)         | trailing edge   | none       |
  | 1280px   | 560px-long title                     | –         | 1280px (100%)    | no (wraps)         | `display: none` | none       |

  The empty actions wrapper computes to `display: none` thanks to `empty:hidden`,
  so it contributes no leftover `gap`.

- **Title scales with the viewport.** `text-xl` on mobile, `sm:text-2xl` above.
- **Light and dark themes.** `text-slate-900 dark:text-white` for the title and
  `text-slate-500 dark:text-slate-400` for the subtitle, matching the
  `slate` palette used across the app and the `dark` custom variant declared in
  `apps/web/src/styles.css`.
- **Actions are projected, not declared.** A plain `<ng-content />` means each
  page passes exactly the controls it needs. Projection is inherently live, so
  actions that appear later (behind `@if`, a signal, …) are picked up
  automatically — no signal query is needed.

### Caveat: very wide actions on mobile

Because the actions are `shrink-0` and share a single row with the title, a page
that projects a control wider than roughly half the screen will overflow
horizontally on mobile. Pages with a wide mobile control should hide it below
`sm` (as `resident-home-page` does with its "Nuevo" button) rather than widen it.

- **Empty actions area costs nothing.** The wrapper carries Tailwind's
  `empty:hidden` variant, so a page that projects nothing leaves no empty flex
  row behind (and no residual `gap` on mobile). Angular strips
  whitespace-only text nodes, so the wrapper really is `:empty` and the variant
  matches. This same `:empty` state is what releases the title's `max-width`
  (see above). It is asserted in the unit tests.

## Usage

Title and subtitle only:

```html
<app-page-header
  title="Unidades"
  subTitle="Busca, filtra y administra las unidades de la plataforma."
/>
```

With page actions:

```html
<app-page-header
  title="Vecinos"
  subTitle="Busca y administra los fraccionamientos."
>
  <p-button icon="pi pi-plus" label="Nuevo" (click)="create()" />
</app-page-header>
```

Dynamic copy (forms switching between create/update):

```html
<app-page-header
  [title]="(id() ? 'Actualizar' : 'Nuevo') + ' fraccionamiento'"
  subTitle="Registra la información básica y las calles que lo componen."
/>
```

With a back button kept **outside** the component:

```html
<div class="flex items-start gap-3 mb-6">
  <p-button
    icon="pi pi-arrow-left"
    severity="secondary"
    variant="outlined"
    size="small"
    aria-label="Regresar a residentes"
    (click)="cancel()"
  />

  <app-page-header
    class="flex-1"
    [title]="(id() ? 'Actualizar' : 'Nuevo') + ' residente'"
    [subTitle]="id() ? 'Actualiza la información básica.' : 'Registra la información básica.'"
  />
</div>
```

`class` on `<app-page-header>` lands on the host element, so it composes with the
component's own header layout (`flex-1`, `mb-6`, …).

## Adopters

| Page                                              | Actions projected   | Notes                                                                                                   |
| ------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `features/units/pages/units-home-page`            | –                   | title + subtitle                                                                                        |
| `features/user/pages/profile-home-page`           | –                   | title + subtitle, `mb-6`                                                                                |
| `features/residents/pages/resident-home-page`     | `p-button` "Nuevo"  | projected inside `@if (!sessionService.isMobile())` so mobile projects nothing and keeps the mobile FAB |
| `features/neighborhoods/pages/neigh-form-page`    | –                   | dynamic title, `mb-6`                                                                                   |
| `features/residents/pages/resident-form-page`     | –                   | back button outside, dynamic title and subtitle                                                         |
| `features/neighborhoods/pages/neigh-details-page` | `p-button` "Editar" | back button outside                                                                                     |

Not adopters (intentionally):

- `features/neighborhoods/pages/neigh-home-page` renders a count chip next to the
  title, and the component has no slot for it. Either add a `#titleMeta` slot or
  keep the page's own markup.
- `features/auth/pages/*` and the `onboarding` components use a centred
  single-column heading, a different layout.
- `features/dashboard/dashboard-container.html` is a mock (`hidden`).

## Implementation notes

- **The host is `display: block`.** An Angular component host is `inline` by
  default, and vertical margins have **no effect** on an inline box. Verified in
  headless Chromium: with an `inline` host a `mb-6` computes to `margin-bottom:
24px` but produces a **0px** gap; with a `block` host the gap is the expected
  24px. The decorator therefore sets `host: { class: 'block' }` so the `mb-6`
  used by `units-home-page`, `profile-home-page` and `neigh-form-page` (and
  `flex-1` on a flex-item host) actually work. Consumers no longer need
  `class="block"`. jsdom has no layout engine, so unit tests cannot catch this
  class of bug — check the compiled CSS or a real browser.
- No local CSS: `page-header.css` was deleted. All styling is Tailwind v4
  utilities, per the styling rules for this workspace.
- `standalone: true` and `ChangeDetectionStrategy.OnPush` are set explicitly; the
  component has no `imports` because the template needs none.
- The project has no `@theme` block — it uses the stock Tailwind v4 `slate`
  palette plus a `dark` custom variant in `styles.css`. The class names here
  deliberately match the rest of the app rather than inventing new tokens.
- The `max-sm:has-[…]:max-w-1/2`, `truncate`, `sm:whitespace-normal`,
  `sm:max-w-none` and `empty:hidden` utilities were each confirmed to be present
  in the compiled stylesheet (checked with `@tailwindcss/postcss`; also in
  `dist/apps/web/browser/styles-*.css`). A misspelled Tailwind utility produces
  no rule and fails silently, so verify new ones there (or in a browser) rather
  than trusting the markup. The conditional cap compiles to:

  ```css
  @media (width < 40rem) {
    .max-sm\:has-\[\~\.page-header-actions\:not\(\:empty\)\]\:max-w-1\/2:has(
        ~ .page-header-actions:not(:empty)
      ) {
      max-width: calc(1 / 2 * 100%);
    }
  }
  @media (width >= 40rem) {
    .sm\:max-w-none {
      max-width: none;
    }
  }
  ```

  **Do not use `_` inside an arbitrary variant:** Tailwind v4 converts `_` to a
  space, so a hook named `page-header__actions` compiles to
  `:has(~ .page-header actions:not(:empty))` — a selector that matches nothing.
  The hook is `page-header-actions` for that reason.

- The class hook `page-header-actions` is a plain selector hook, not a custom CSS
  class: it carries no declarations of its own and exists only as the target of
  the `:has()` selector above.

## Test coverage

`apps/web/src/app/_shared/components/page-header/page-header.spec.ts` — 29 tests:

- creation; `title` rendered as the single `<h1>`; semantic `<header>` root.
- subtitle rendered when provided; no `<p>` when omitted or empty.
- subtitle hidden on mobile (`hidden` + `sm:block`); title never hidden.
- title scaling (`text-xl` / `sm:text-2xl`) and light/dark classes for both the
  title and the subtitle.
- layout: one `flex items-center justify-between` row on every viewport (and
  _not_ `flex-col`), the title block kept at `min-w-0` with the **conditional**
  cap `max-sm:has-[~.page-header-actions:not(:empty)]:max-w-1/2` plus
  `sm:max-w-none`, the title `truncate` + `sm:whitespace-normal`, the actions
  `shrink-0`, and the title block not claiming leftover space (no
  `flex-1`/`grow`/`w-full`).
- the actions wrapper is `empty:hidden`, really matches `:empty`, and carries the
  `page-header-actions` hook the conditional cap targets.
- content projection: actions land outside the title block, after the title in
  DOM order, never inside the `<h1>`/`<p>`, are independent from the subtitle,
  and appear when projected after the first render; the wrapper flips from
  `:empty` to non-empty the moment actions are projected, which is what releases
  the title cap. jsdom's selector engine only supports `:has()` with a child
  combinator, so that last assertion checks the DOM preconditions rather than
  evaluating `:has(~ …)`.
- `title` is mandatory: reading it without a value throws `NG0950`, and the
  component renders normally once it is provided.
