# UnitsModule

`apps/api/src/administration/units/units.module.ts`

Feature module for unit management: creation, listing and statistics within a neighborhood scope.

## Composition

| Type | Provider |
|---|---|
| Controllers | `UnitsController` |
| Providers (and exports) | `UnitService`, `UnitSearchService` |
| Imports | `TypeOrmModule.forFeature([Unit, UserUnit])`, `CatalogsModule`, `CoreModule`, `forwardRef(() => NeighborhoodModule)` |

`UnitService` depends on `NeighStreetService`, which is exported by `NeighborhoodModule`; the `forwardRef` breaks the `UnitsModule ↔ (NeighborhoodModule → ResidentModule → UnitsModule)` dependency cycle.

## Consumers

- `AppModule` registers `UnitsModule`.
- `UserModule` and `ResidentModule` import it to reuse `UnitService` / `UnitSearchService`.
- `OnboardingController` (`POST /onboarding/unit`) calls `UnitService.create`.
