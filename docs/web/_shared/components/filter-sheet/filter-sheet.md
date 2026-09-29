# FilterSheet (`app-filter-sheet`)

Generic bottom sheet used to host a filter form when the inline filters do not
fit the viewport. It is a presentational overlay: it owns nothing but the
visibility of the sheet, so the consumer keeps ownership of the filter state and
decides when a draft becomes an applied filter.

- **Selector:** `app-filter-sheet`
- **File:** `apps/web/src/app/_shared/components/filter-sheet/filter-sheet.ts`
- **Template:** `filter-sheet.html`
- **Tests:** `filter-sheet.spec.ts` (13 tests)
- **Exported from:** `@shared/components`

## API

| Member | Type | Description |
| --- | --- | --- |
| `visible` | `model<boolean>` | Two-way visibility of the sheet. |
| `title` | `input.required<string>()` | Title rendered in the sheet header, next to the close button. |
| `closed` | `output<void>()` | Emitted on every dismissal (Esc, close button, mask). |
| `pt` | `protected` const | Pass-through forwarded to `p-drawer`. Not part of the public API. |

> Inputs and outputs must stay `public`: the AOT template type-checker rejects
> `protected` signal inputs bound from another component's template, and plain
> `tsc --noEmit` does **not** catch it. Only `nx build` surfaces it.

## Slots

| Slot | Target | Notes |
| --- | --- | --- |
| *(default)* | `p-drawer` content | The filter form. |
| `[filterSheetFooter]` | `p-drawer` footer | Action buttons. The footer section is only rendered when this slot is used. |

## Usage

```html
<app-filter-sheet title="Filtros" [visible]="sheetOpen()" (closed)="onSheetClosed()">
  <div class="px-4 py-4">
    <app-neigh-table-filters
      [value]="draft()"
      [debounceMs]="0"
      (filter)="draft.set($event)"
    />
  </div>

  <div filterSheetFooter class="flex items-center gap-2 border-t p-4">
    <p-button label="Limpiar" severity="secondary" [text]="true" (click)="clearDraft()" />
    <p-button label="Aplicar" class="flex-1" [disabled]="!hasPendingChanges()" (click)="applyFilters()" />
  </div>
</app-filter-sheet>
```

## Behaviour

- `position="bottom"`, `appendTo="body"` and `blockScroll` are fixed.
  `appendTo="body"` keeps the `position: fixed` overlay out of any transformed
  ancestor of the page markup.
- Nothing is rendered in the DOM while `visible` is `false`: `p-drawer` only
  instantiates its panel after the first `true`.
- Closing flows through `visibleChange`, so the `visible` model is kept in sync
  and `closed` is emitted exactly once per dismissal.

## Height overrides

Optimus ships a bottom drawer that is unusable for a form:

```css
.p-drawer-bottom { height: 10rem; }
.p-drawer-bottom .p-drawer-content { height: 100%; }
```

`SHEET_PT` releases both, because `height: 100%` inside an auto-height flex
column collapses the sheet:

| Section | Classes | Reason |
| --- | --- | --- |
| `host` | `contents` | The mask is projected here; stretch it to the viewport. |
| `root` | `h-auto max-h-[85vh] rounded-t-2xl` | Hug the content, cap at 85vh, round the top corners. |
| `content` | `h-auto p-0 overflow-y-auto` | Overrides `height: 100%`; the consumer owns the padding. |
| `footer` | `p-0` | Same, the consumer owns the padding. |

Verified in Chromium against the real compiled CSS:

| Viewport | Form | Sheet height | Content scrolls |
| --- | --- | --- | --- |
| 375×667 | one field | 138px (hugs content) | no |
| 375×667 | six rows | 566.9px (= 85vh cap) | yes |
| 1280×800 | one field | 138px | no |

## Testing notes

`p-drawer` binds its Escape handler to the legacy `event.which == 27`, which a
synthetic `KeyboardEvent` never sets. Tests must force it:

```ts
const event = new KeyboardEvent('keydown', { key: 'Escape' });
Object.defineProperty(event, 'which', { value: 27 });
document.dispatchEvent(event);
```

The close handler lives on the inner `<button>` rendered by `p-button`, not on
the `p-button` host, so a click must target `.p-drawer-close-button button`.
