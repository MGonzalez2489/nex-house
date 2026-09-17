# StorageProvider

## Location
`apps/api/src/storage/storage.provider.ts`

## Purpose
Builds the multer storage engine used by the avatar upload endpoint and resolves
the uploads root directory.

## Environment
- `UPLOAD_DIR` (`UPLOAD_DIR_ENV_KEY`) — uploads root directory; falls back to
  `uploads` (`DEFAULT_UPLOAD_DIR`) when unset.
- Relative values are resolved against `process.cwd()` (repo root); absolute
  paths are used as-is. Never point it inside `apps/api` (upload rebuilds the API).

## Exports
- `UPLOAD_DIR_ENV_KEY: 'UPLOAD_DIR'`
- `DEFAULT_UPLOAD_DIR: 'uploads'`
- `AVATARS_FOLDER: 'avatars'` — subfolder where avatar files are stored.
- `resolveUploadsDir(configService: ConfigService): string` — resolves the
  uploads root from the `ConfigService`.
- `StorageProvider` (`@Injectable`) — exposes `getMulterStorage(): StorageEngine`.

## getMulterStorage()
Returns multer's `diskStorage` configured for the uploads root:
- Files land in `<uploads-root>/avatars` (created recursively if missing).
- Each file gets a `randomUUID()` filename with a sanitized extension
  (`/[a-z0-9]+/i` whitelist, `bin` fallback).