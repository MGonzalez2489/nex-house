# StorageService

## Location
`apps/api/src/storage/storage.service.ts`

## Purpose
Persists and removes uploaded file records and their physical files.

## Dependencies
- `@InjectRepository(NxFile)` — TypeORM repository for `NxFile` entities.
- `ConfigService` — resolves the uploads root (via `resolveUploadsDir`).
- `StorageProvider` — supplies `resolveUploadsDir` through `./storage.provider`.

## API

### `uploadFile(url: string, file: Express.Multer.File, prevFileId?: number): Promise<NxFile>`
- No `prevFileId`: creates and saves a fresh `NxFile` record from the file
  metadata (original name, storage filename, mime type, size, url, extension).
- With `prevFileId`: loads the existing record (`NotFoundException` if missing),
  returns it unchanged when the URL matches, otherwise updates the metadata via
  `Object.assign` + `save` and best-effort removes the previous physical file
  (in `deleteStoredFile`); cleanup failures are logged and never reject.

### `deleteStoredFile(storageUrl: string): Promise<void>`
Resolves the storage URL to an absolute path under `<uploads-root>/avatars`
(`resolveStoredFilePath`) and `unlink`s it. `ENOENT` is tolerated; other
failures are logged and swallowed so cleanup never fails the surrounding request.

### Private helpers
- `resolveStoredFilePath(storageUrl)` — maps URL segments onto the resolved
  uploads root, tolerating an optional uploads-root prefix in the stored URL.
- `parseStorageUrl(storageUrl)` — extracts the stored `fileName` and a
  sanitized `extension` (`bin` fallback) from the URL.