# NexCard (web)

Responsive wrapper around the Optimus UI `Panel`. It keeps the panel chrome
(border, radius, background, padding) on desktop and strips it on mobile so the
body can use the full viewport width, and it gives the application a single,
collision-free slot API on top of the panel sections.

- **Selector:** `app-nex-card`
- **Files:** `nex-card.ts`, `nex-card.html`
- **Wrapped component:** `Panel` from `@openng/optimus-ui/panel`
- **Exported through:** `@shared/components`
- **Change detection:** `OnPush`, standalone, zoneless-safe
- **Local styles:** none (Tailwind utilities only, per the styling rules)

## Why the slots are namespaced

The wrapper re-exposes the exact same sections that `Panel` queries internally
(`#header`, `#icons`, `#content`, `#footer`). Reusing those unprefixed names
made the wrapper ambiguous and prone to hijacking the slots of the Optimus
components rendered inside the body, so every consumer-facing slot is prefixed
with `nex`.

| Slot (`ng-template` ref) | Renders into                                         | Notes                                 |
| ------------------------ | ---------------------------------------------------- | ------------------------------------- |
| `#nexHeader`             | panel header, left side                              | Overrides `headerText`                |
| `#nexActions`            | panel header, right side (`.p-panel-header-actions`) | Replaces the panel `#icons` slot      |
| _(loose content)_        | panel body (`.p-panel-content`)                      | Plain child nodes, no template needed |
| `#nexContent`            | panel body (`.p-panel-content`)                      | Rendered after the loose content      |
| `#nexFooter`             | panel footer (`.p-panel-footer`)                     | Footer element is hidden while empty  |

Optimus slot names (`#header`, `#icons`, `#content`, `#footer`) are **not**
supported and are silently ignored.

## Inputs

| Name             | Type                        | Default | Description                                                     |
| ---------------- | --------------------------- | ------- | --------------------------------------------------------------- |
| `headerText`     | `string`                    | –       | Plain title rendered as a level 2 heading inside the header     |
| `noCardOnMobile` | `boolean`                   | `true`  | Removes the panel chrome when the viewport is mobile            |
| `toggleable`     | `boolean`                   | `false` | Enables the `Panel` collapse/expand button                      |
| `collapsed`      | `boolean` (two-way `model`) | `false` | Collapsed state, only meaningful with `toggleable`              |
| `pt`             | `PanelPassThrough`          | –       | Pass-through applied on every viewport                          |
| `mobilePt`       | `PanelPassThrough`          | –       | Pass-through applied on top of `pt` when the viewport is mobile |

`booleanAttribute` is used for `noCardOnMobile` and `toggleable`, so
`noCardOnMobile="false"` works as expected.

## Dependencies

- `SessionService` (`@core/services`) — `isMobile()` drives the flattening. It
  is a `computed` signal fed by a debounced `window.resize` listener
  (`small` / `medium` / `large`, breakpoint at Tailwind's `md` = 768px), so
  rotating a device or resizing the window updates the card reactively.

## Behavior

- **Flattening.** `flattened = noCardOnMobile() && isMobile()`. When `true` the
  `FLAT_PT` pass-through is merged in:
  `root: bg-transparent border-0 rounded-none`, `header: bg-transparent border-0 px-0 pt-0`,
  `content: px-0`, `footer: px-0 pt-0`. These neutralise exactly the rules the
  Aura theme applies to `.p-panel`, `.p-panel-header`, `.p-panel-content` and
  `.p-panel-footer`.
- **Empty header.** `showHeader` is bound to `showPanelHeader()`
  (`toggleable() || headerText() || headerTemplate() || actionsTemplate()`), so
  no empty header bar is rendered when there is nothing to show.
- **Empty footer.** The `#footer` template is always projected, so the footer
  element is hidden with the `hidden` utility while `footerTemplate()` is empty.
- **Pass-through merging.** `mergePt` concatenates two sections when both are
  class strings, so `pt`/`mobilePt` _add_ to a section instead of replacing it.
  Attribute records and callbacks let the later source win. A function
  pass-through is forwarded untouched. Precedence on mobile is
  `pt` → flatten defaults → `mobilePt`.
- **Tailwind precedence.** Because every `pt` value is a plain utility class,
  the winner between two competing utilities is decided by Tailwind's stylesheet
  order, not by the order in the class attribute. Use the important modifier
  (`rounded-lg!`) when a consumer has to beat one of the flatten defaults.

## Why the overrides actually apply (cascade layers)

The flatten only works because of the cascade layer configuration in
`apps/web/src/app/app.config.ts`:

```ts
provideOptimus({
  theme: {
    preset: NxPreset,
    options: { darkModeSelector: '.dark', cssLayer: { name: 'optimus', order: 'theme, base, optimus' } },
  },
});
```

`@import 'tailwindcss'` declares `@layer theme, base, components, utilities`, so
Tailwind's `utilities` layer would normally sit *before* a layer created later,
letting the Optimus component CSS win. The Optimus style engine emits
`@layer theme, base, optimus` through `UseStyle.use(..., { first: true })`, which
does `head.insertBefore(styleEl, head.firstChild)` — the statement is prepended
to `<head>`, i.e. parsed **before** the build-time Tailwind stylesheet. Layer
order therefore resolves to `theme, base, optimus, components, utilities`, and
the Tailwind utilities from `pt` win over the Aura panel rules.

Verified in headless Chromium with the two real `@layer` statements: with the
Optimus statement first, a `p-panel-content px-0` element computes
`padding-left: 0px` and `p-panel bg-transparent border-0 rounded-none` computes
`0px` border / transparent background / `0px` radius; with the statements
reversed the theme padding (18px) and the panel border win. **Do not remove
`cssLayer` from `app.config.ts`**, otherwise every responsive override in the
project silently stops working.

## Implementation notes

Two Angular behaviours drove the current design, both verified with unit tests:

1. **Signal content queries, not `@ContentChild`.** The previous
   `@ContentChild` properties were read inside a `computed()`
   (`shouldRenderHeaderSlot`). A plain property is not a signal dependency, so the
   computed cached its first result forever and a header template that appeared
   after the first render never showed up. `contentChild()` returns real signals,
   so the slots are safe to derive from `computed()`.
2. **The slot templates are always declared.** `Panel` resolves its own slots with
   decorator-based `@ContentChild` queries that do **not** re-match a
   `<ng-template #content>` / `<ng-template #footer>` created after the first
   render (verified against `@openng/optimus-ui` 2.0.2). `NexCard` therefore
   declares `#header`, `#icons`, `#content` and `#footer` unconditionally and
   gates only their _inner_ content, which keeps every slot reactive. Presence is
   handled separately through `showHeader` and the `hidden` footer class.

Nested `app-nex-card` instances are safe: the inner card's slots live in the
inner card's own host and are never captured by the outer card.

### Typing the pass-through

`PanelPassThrough` is a **union**, not an object:

```ts
type PanelPassThrough<I> =
  | AllPassThrough<PanelPassThroughOptions>
  | ((context: I) => AllPassThrough<PanelPassThroughOptions>)
  | null
  | undefined;
```

So it cannot be indexed. Writing `type PtSection = PanelPassThrough[string]`
fails to compile with:

```
error TS2537: Type 'PanelPassThrough' has no matching index signature for type 'string'.
```

The section type has to be derived from the **options** interface instead:

```ts
import {PanelPassThrough, PanelPassThroughOptions} from '@openng/optimus-ui/panel';

type PtSection = PanelPassThroughOptions[keyof PanelPassThroughOptions];
type PtRecord = Record<string, PtSection>;
```

`mergePt` therefore accumulates into a `PtRecord` and only casts to
`PanelPassThrough` on return, and it forwards a callback pass-through
untouched (a callback cannot be merged section by section).

**Note:** `nx test web` transpiles only, so type errors like the one above stay
invisible to the unit tests — they only surface in `nx build web` (AOT). Run
`npx tsc -p apps/web/tsconfig.app.json --noEmit` to catch them early.

## Usage

```html
<app-nex-card headerText="Fraccionamientos">
  <ng-template #nexActions>
    <app-neigh-table-filters (filter)="filter($event)" />
  </ng-template>

  <ng-template #nexContent>
    <p-table [value]="items()" [lazy]="true" (onLazyLoad)="search($event)">
      <ng-template #header
        ><tr>
          <th scope="col">Nombre</th>
        </tr></ng-template
      >
      <ng-template #body let-row><td>{{ row.name }}</td></ng-template>
    </p-table>
  </ng-template>

  <ng-template #nexFooter>
    <p-paginator
      [first]="pageFirst()"
      [rows]="pageRows()"
      (onPageChange)="paginateMobile($event)"
    />
  </ng-template>
</app-nex-card>
```

Tuning the mobile look per consumer:

```html
<app-nex-card
  headerText="Detalle"
  [noCardOnMobile]="true"
  [mobilePt]="{ root: 'rounded-xl!' }"
>
  ...
</app-nex-card>
```

Collapsible card:

```html
<app-nex-card
  headerText="Opciones"
  [toggleable]="true"
  [(collapsed)]="isCollapsed()"
>
  ...
</app-nex-card>
```

## Test coverage

`apps/web/src/app/_shared/components/nex-card/nex-card.spec.ts` — 34 tests:

- panel wrapping, empty header suppression, empty footer hiding.
- `headerText` placement inside the header (and _not_ in the body), heading level,
  precedence of `#nexHeader`, and late-arriving header text/templates.
- loose content projection, `#nexContent`, both combined, and late arrival.
- `#nexFooter` rendering, showing and re-hiding when the slot toggles.
- slot isolation: Optimus slot names are not adopted, and a nested card's slots
  are not stolen.
- responsive: chrome kept on desktop, flattened on mobile, padding stripped,
  `noCardOnMobile="false"` opt-out, and reacting to a viewport change back to
  desktop.
- pass-through: applied on every viewport, additive merging, `mobilePt` only on
  mobile, and `mobilePt` with the card kept.
- `toggleable`: header/toggle button rendering and `collapsed` propagation.

`apps/web/src/app/features/neighborhoods/components/neighborhoods-table/neighborhoods-table.spec.ts`
covers the real consumer: report title inside the panel header, filters in the
header actions, and the desktop table body.

## Migration from the previous API

| Before | Now |
|---|---|
| `<ng-template #cardHeader>` | `<ng-template #nexHeader>` |
| `<ng-template #icons>` | `<ng-template #nexActions>` |
| `<ng-template #content>` | `<ng-template #nexContent>` |
| `<ng-template #footer>` | `<ng-template #nexFooter>` |
| content not wrapped in a template | silently dropped → now projected into the body |
| `headerText` rendered in the body | now rendered inside the header |
| `p-panel` used directly by consumers | `app-nex-card` |
