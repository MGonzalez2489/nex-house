# NeighAddressToModelMapper (api)

Maps a `NeighAddress` entity into the shared `NeighAddressModel` contract.

- **File:** `apps/api/src/_core/mappers/neigh-address-to-model.mapper.ts`
- **Used by:** `NeighborhoodToModelMapper`
  (`apps/api/src/_core/mappers/neighborhood-to-model.mapper.ts`) when building
  the neighborhood payload for list/mine/detail endpoints.

## Behavior

Returns:

```ts
{
  zipCode: address.zipCode,
  latitude: address.latitude,
  longitud: address.longitude,
  publicId: address.publicId,
  city: address.city ? CatalogToModelMapper(address.city) : undefined,
}
```

## Fix (guard for optional relation)

`city` is a lazy/optional relation. The guard uses a ternary
(`address.city ? CatalogToModelMapper(address.city) : undefined`) instead of a
nullish-coalescing call `address.city ?? CatalogToModelMapper(address.city)`
which evaluated `CatalogToModelMapper` eagerly and threw when `city` was
`undefined`/`null`.

## Note

`longitud` reflects the **source column name** (`longitude` on the entity) —
the typo is preserved in the shared model by design.