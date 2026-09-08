# API Modules

Dependency graph of the NestJS modules in `apps/api/src`. Solid arrows = module import; dashed = `forwardRef` circular dependency. `@Global` modules are injectable everywhere without importing.

```mermaid
flowchart TB
    App["<b>AppModule</b><br/><small>Composition root · DB seeder · global JwtAuthGuard + NeighborhoodInterceptor</small>"]

    Core["<b>CoreModule</b><br/><small>CryptoService</small>"]

    subgraph infra["Infrastructure"]
        ApiCache["<b>ApiCacheModule</b><br/><small>@Global · CacheModule (15 min TTL)</small>"]
        Storage["<b>StorageModule</b><br/><small>@Global · Multer + StorageService</small>"]
    end

    AuthMod["<b>AuthModule</b><br/><small>AuthController · SessionService · JwtStrategy</small>"]
    Catalogs["<b>CatalogsModule</b><br/><small>CatalogsService</small>"]

    subgraph administration["Administration"]
        direction TB
        Neighborhood["<b>NeighborhoodModule</b><br/><small>Neighborhood + NeighSearch controllers</small>"]
        Units["<b>UnitsModule</b><br/><small>UnitService · UnitSearchService</small>"]
        UserMod["<b>UserModule</b><br/><small>User / Profile / Onboarding services</small>"]
        Resident["<b>ResidentModule</b><br/><small>ResidentService · ResidentStatsService</small>"]
    end

    App --> ApiCache
    App --> Storage
    App --> AuthMod
    App --> Catalogs
    App --> Neighborhood
    App --> Units
    App --> UserMod
    App --> Resident

    AuthMod --> UserMod
    Core -->|provided to| Units
    Core -->|provided to| UserMod
    Core -->|provided to| Resident

    Catalogs -->|provided to| Neighborhood
    Catalogs -->|provided to| Units
    Catalogs -->|provided to| UserMod
    Catalogs -->|provided to| Resident

    Storage -->|provided to| UserMod
    Storage -->|provided to| Resident

    Neighborhood --> Resident
    Units --> Catalogs
    Units --> Core
    Units -.->|forwardRef| Neighborhood
    UserMod --> Units
    Resident --> Units
    Resident --> Catalogs
    Resident --> Core
```

## Routes

All under the global `api/` prefix:

| Module | Controller | Route |
|---|---|---|
| Auth | `AuthController` | `auth` |
| Catalogs | `CatalogsController` | `catalogs` |
| Neighborhood | `NeighborhoodController`, `NeighSearchController` | `neighborhood` |
| Units | `UnitsController` | `neighborhood/:neighborhoodId/units` |
| Residents | `ResidentController` | `neighborhoods/:neighborhoodId/residents` |
| User | `UserController`, `ProfileController`, `OnboardingController` | `user`, `user/profile`, `onboarding` |

## Notes

- `UnitsModule` ↔ `NeighborhoodModule` is the only circular dependency, resolved via `forwardRef`.
- `ApiCacheModule` and `StorageModule` are `@Global`; `UserModule`/`ResidentModule` still import `StorageModule` explicitly (redundant but harmless).
- Auth exposes nothing; other modules depend on `UserModule`, not `AuthModule`.