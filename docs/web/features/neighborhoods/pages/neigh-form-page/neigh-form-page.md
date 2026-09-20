# NeighFormPage (web)

Reactive create/edit page for a neighborhood. Reuses one component for both
modes, keyed off the optional route `id` input.

- **File:** `apps/web/src/app/features/neighborhoods/pages/neigh-form-page/neigh-form-page.ts`
- **Template:** `neigh-form-page.html` (standalone)

## Inputs

| Input | Type | Description |
|---|---|---|
| `id` | `string \| undefined` | Set → update mode (`:id/edit`); unset → create mode (`new`) |

## Form model

```ts
form = fb.nonNullable.group({
  name, countryId, stateId, cityId, zipCode, firstAdminEmail, active,
  streets: FormArray<FormGroup<{ name, publicId }>>
})
```

- `isEdit = computed(() => Boolean(id()))`.
- Constructor: when catalogs are loaded it prefills Mexico / Chihuahua /
  Chihuahua by **name** lookup (`cCountry.find(f => f.name === 'mexico')`) and
  patches `countryId`/`stateId`/`cityId`, falling back to `''` and re-running
  `updateValueAndValidity`.
- `streets` is a `FormArray`; `addStreet()`/`removeStreet(idx)` manage it —
  removing the last element resets it instead of emptying the array.

## Mode init

`ngOnInit` branches on `id()`:

- **Create** — `initForCreate()`: enables the creation-only fields and adds one
  empty street.
- **Update** — `initForUpdate(id)`:
  1. `store.findById(id)` (cache-first).
  2. Patches `name`, `active`, `zipCode` (from `address?.zipCode ?? ''`) and,
     when `address.city` exists, `stateId`/`cityId` (falling back to the
     current control values).
  3. Replaces the street array with the model streets (or one empty row when
     none).
  4. **Locks** the creation-only controls (`countryId`, `stateId`, `cityId`,
     `zipCode`, `firstAdminEmail`) via `setCreationFieldsEnabled(false)`.

### `setCreationFieldsEnabled(enabled: boolean)`

Enables/disables the location + first-admin controls. Location and first admin
are **not** editable in edit mode because the `PATCH` endpoint contract does not
accept `cityId`/`zipCode`/`adminEmail`; disabling keeps their required
validators from blocking the submit while the mapped payload stays
API-compatible.

## Submit

`submit()` marks all controls touched (including every street) and bails when
`form.invalid`. Otherwise it calls `create()` or `update()` depending on
`id()`, then navigates to `HOME` on success.

- `create()` → `store.create(mapCreateNeighborhoodPayload(getRawValue()))`.
- `update()` → `store.update(id, mapUpdateNeighborhoodPayload(getRawValue()))`.

Payload building lives in the pure helpers of `neigh-form.mapper.ts`.

## Template notes (a11y & fixes)

- "Agregar calle" / "Eliminar calle" `p-button`s carry `type="button"` so they
  no longer trigger an implicit form submit.
- `aria-describedby` matches the real error ids: `name-errors`, `zipCode-errors`,
  and per-row `street-errors-{index}`.
- Selects use `inputId` (`country`, `state`, `city`) linked to their `<label
  for>` instead of a container `id` (duplicate-id risk).
- The active toggle uses `inputId="isActive"` plus `aria-labelledby` pointing at
  the adjacent paragraph (`isActive-label`).
- Each street input has a `sr-only` label ("Nombre de la calle N") with a
  unique `id`; the hidden `publicId` input keeps the street identity for the
  update diff.
- Removed dead "back" button (`class="hidden"`) — navigation now goes through
  the cancel/actions row.