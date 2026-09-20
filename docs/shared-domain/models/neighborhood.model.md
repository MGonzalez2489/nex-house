# NeighborhoodModel (shared-domain)

Read model for a neighborhood, consumed by both apps.

- **File:** `libs/shared-domain/src/lib/models/neighborhood.model.ts`
- **Import via:** `@nexhouse/shared-domain/models`

## Interface

```ts
export interface NeighborhoodModel extends BaseModel {
  name: string;
  isActive: boolean;
  streets: NeighStreetModel[];
  address?: NeighAddressModel;
}
```

`BaseModel` supplies `publicId`, `createdAt`, `updatedAt`.

## `address?: NeighAddressModel` (optional)

The relation is optional:

- Neighborhoods may exist without an associated address (creation via the
  legacy/street-first flow), in which case mappers return `undefined` for
  `address`.
- The API list/mine/detail endpoints load the relation with
  `relations: { streets: true, address: { city: { state: true } } }` and map it
  with `NeighAddressToModelMapper` (which now guards a missing `city`).
- Web pages must use optional access (`neigh.address?.city?.displayName`); the
  ternary chain is already used throughout `neighborhoods-table` and detail
  templates.

## Related models

- `NeighAddressModel` — `zipCode`, `latitude`, `longitud`, `publicId`,
  `city?: CatalogModel`.
- `NeighStreetModel` — street inside a neighborhood (`name`, `publicId`).