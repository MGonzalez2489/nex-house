# StorageModule

## Location
`apps/api/src/storage/storage.module.ts`

## Purpose
Global storage module wiring the multer upload engine, the repository, and the
storage service so the whole API can rely on a single configured upload setup.

## Declarations
- `@Global()` — makes the module's providers available app-wide.
- Imports:
  - `TypeOrmModule.forFeature([NxFile])` — registers the `NxFile` repository.
  - `MulterModule.registerAsync(...)` — async factory, injecting `ConfigService`
    and `StorageProvider`, using `storageProvider.getMulterStorage()` as the
    upload storage engine.
- Providers: `StorageProvider`, `StorageService`.
- Exports: `StorageProvider`, `StorageService`, `MulterModule`.

## Dependencies
- `@core/database` — `NxFile` entity.
- `@nestjs/config` — `ConfigService` for `UPLOAD_DIR` resolution.
- `@nestjs/platform-express` — `MulterModule`.