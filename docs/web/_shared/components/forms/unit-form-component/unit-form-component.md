# UnitFormComponent (web)

Shared form used by the resident flows to attach a unit to a resident: either
pick an existing unit or describe a new one. It is a `ControlValueAccessor`, so
the parent form owns a `CreateUnit | null` control and never touches the
component's internal form.

- **Files:** `unit-form-component.ts`, `unit-form-component.html`,
  `unit-form.ts`
- **Selector:** `app-unit-form-component`
- **Exported through:** `@shared/components`
- **Change detection:** `OnPush`, standalone, zoneless-safe
- **Local styles:** none (Tailwind utilities only)

## Inputs

| Name              | Type                 | Required | Default     | Description                                                                            |
| ----------------- | -------------------- | -------- | ----------- | -------------------------------------------------------------------------------------- |
| `streets`         | `NeighStreetModel[]` | ✅       | –           | Options of the "Calle" select                                                          |
| `unitTypes`       | `BaseCatalogModel[]` | ✅       | –           | Unit type cards; the first one is the default `unitTypeId`                             |
| `unitRoles`       | `BaseCatalogModel[]` | ✅       | –           | Options of "Relación con la unidad"; the first one is the default                      |
| `searchUnits`     | `UnitModel[]`        | no       | `[]`        | Options of the "Buscar unidad" select (existing-unit mode)                             |
| `canPickExisting` | `boolean`            | no       | `false`     | Shows the "Buscar existente" / "Registrar nueva" switch                                |
| `isLoading`       | `boolean`            | no       | `false`     | Forwarded by consumers to their own action row                                         |
| `user`            | `UserModel`          | no       | `undefined` | Source of `userId` in the emitted payload                                              |
| `handledByParent` | `boolean`            | no       | `false`     | Skips `applyCatalogDefaults()` in `ngOnInit` (the parent already patched the catalogs) |

## Outputs

| Name       | Type         | Description                                                           |
| ---------- | ------------ | --------------------------------------------------------------------- |
| `doSubmit` | `CreateUnit` | Emitted by the internal form `submit` when the current mode is valid. |

## Modes

`mode` is a `signal<UnitMode>('create')` driven either by the toggle button (only
rendered when `canPickExisting()`) or by `writeValue()`:

| Mode       | Visible fields                                                                   | Required                     |
| ---------- | -------------------------------------------------------------------------------- | ---------------------------- |
| `create`   | `streetId`, `unitIdentifier`, unit type cards, `unitRoleId`, `isCurrentOccupant` | `streetId`, `unitIdentifier` |
| `existing` | `unitId`, `unitRoleId`, `isCurrentOccupant`                                      | `unitId`                     |

The requirement is switched in an `effect` that watches `mode()` and calls
`updateValueAndValidity()`, so switching modes re-validates immediately.

## `ControlValueAccessor`

- `NG_VALUE_ACCESSOR` is provided with `useExisting` + `multi: true`.
- `writeValue(value)`:
  - with a `unitId` → switches to `existing` and patches the three fields of an
    assignment;
  - without a `unitId` → switches to `create` and patches the full value;
  - `null` → resets silently (`emitEvent: false`) and re-applies the catalog
    defaults.
- `registerOnChange` is called by a second `effect` on every
  `form.valueChanges` emission (via `toSignal`), pushing `buildPayload()` to the
  parent — so the parent control is always in sync, not only on submit.
- `parentTouched()` reads the private `_touched` accessor of the parent `NgControl`
  (Angular 22) with a fallback to `control.touched`, which lets the child show
  errors as soon as the _parent_ form is touched — the component is often never
  blurred on its own.
- `setDisabledState` enables/disables the whole inner form.

## Template notes

- Section title: `text-base font-semibold text-slate-900 dark:text-white`
  (level 2 of the type scale, identical to `app-nex-card`'s `headerText`),
  supporting line `text-sm text-slate-500 dark:text-slate-400`.
- Labels use the global `.form-label` (level 3) and each error block is
  `app-form-validation-error` wired through `aria-describedby` with ids
  `street-errors`, `identifier-errors`, `unit-errors`.
- The unit type picker is a list of real `<button type="button">` elements with
  `bg-cyan-50` / `border-cyan-300` (`dark:bg-cyan-700`) on the selected card, so
  it is keyboard reachable; the Optimus `p-toggleswitch` reuses the same palette.
- The "Habita la unidad" toggle label overrides the label margin with
  `m-1!` (important modifier) because the wrapper uses `flex items-end`.
- `<ng-content />` at the end lets a consumer project its own action row (the
  resident form projects its cancel/save row there).

## Test coverage

`unit-form-component.spec.ts` covers creation, the `writeValue`/`existing` mode
switch, payload building, catalog defaults and `setDisabledState`.
