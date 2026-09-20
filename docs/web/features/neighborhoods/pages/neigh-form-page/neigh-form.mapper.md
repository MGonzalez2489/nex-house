# neigh-form.mapper (web)

Pure, side-effect-free functions that translate the neighborhood form raw value
into the API DTOs. Keeping mapping out of the page component makes the payload
construction unit-testable.

- **File:** `apps/web/src/app/features/neighborhoods/pages/neigh-form-page/neigh-form.mapper.ts`

## Types

### `StreetFormValues`

```ts
{ name: string; publicId: string | null }
```

### `NeighborhoodFormValues`

```ts
{
  name: string;
  active: boolean;
  firstAdminEmail: string;
  cityId: string;
  zipCode: string;
  streets: StreetFormValues[];
}
```

`countryId`/`stateId` are deliberately excluded: the backend derives those
through the city reference.

## `mapCreateNeighborhoodPayload(values): CreateNeighborhood`

Builds the `POST /api/neighborhood` body:

```ts
{
  name: values.name.trim(),
  adminEmail: values.firstAdminEmail.trim(),
  streets: values.streets.map(s => ({ name: s.name.trim() })),
  isActive: values.active,
  cityId: values.cityId,
  zipCode: values.zipCode,
}
```

Street entries are normalized to `{ name }` only — brand-new streets carry no
`publicId`.

## `mapUpdateNeighborhoodPayload(values): UpdateNeighborhood`

Builds the `PATCH /api/neighborhood/:id` body. Accepts only the editable subset
(`name`, `active`, `streets`) and includes `street.publicId` **only** when it
already exists so the API can compute create/update/remove diffs:

```ts
{
  name: values.name.trim(),
  isActive: values.active,
  streets: values.streets.map(s => ({ name: s.name.trim(), ...(s.publicId ? { publicId: s.publicId } : {}) })),
}
```

Location and first-admin are intentionally absent (not part of the PATCH
contract).

## Test coverage

- `apps/web/src/app/features/neighborhoods/pages/neigh-form-page/neigh-form.mapper.spec.ts`
- Covers trimming/normalization for both payload builders, omission of
  country/state on create, and the conditional `publicId` on update.