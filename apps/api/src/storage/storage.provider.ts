import { getAvatarFolderFullPath } from '@core/utils';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage, StorageEngine } from 'multer';

export const UPLOAD_DIR_ENV_KEY = 'UPLOAD_DIR';
export const DEFAULT_UPLOAD_DIR = 'uploads';

/**
 * Resolves the uploads root directory, defaulting to `uploads` when the
 * environment value is not configured.
 */
export function resolveUploadsDir(configService: ConfigService): string {
  return configService.get<string>(UPLOAD_DIR_ENV_KEY) ?? DEFAULT_UPLOAD_DIR;
}

@Injectable()
export class StorageProvider {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Builds a multer `diskStorage` engine that persists uploads under
   * `<uploads-root>/avatars` with unpredictable unique filenames.
   */
  getMulterStorage(): StorageEngine {
    const destination = getAvatarFolderFullPath(
      resolveUploadsDir(this.configService),
      '',
    );

    this.ensureDirectory(destination);

    return diskStorage({
      destination,
      filename: (req, file, cb) => {
        void req;
        cb(null, this.buildFilename(file.mimetype));
      },
    });
  }

  /**
   * Generates a unique `crypto.randomUUID()` filename keeping a sanitized
   * extension derived from the mime type (falls back to `bin`).
   */
  private buildFilename(mimetype: string): string {
    return `${randomUUID()}.${this.resolveExtension(mimetype)}`;
  }

  /**
   * Extracts a safe, lowercase alphanumeric extension from `mimetype`.
   * `image/svg+xml`-like values or missing slashes collapse to `bin` so the
   * stored extension never carries path/traversal characters.
   */
  private resolveExtension(mimetype: string): string {
    const candidate = mimetype.split('/').pop() ?? '';
    return /^[a-z0-9]+$/i.test(candidate) ? candidate.toLowerCase() : 'bin';
  }

  /**
   * Multer disk storage does not create the destination directory by itself, so
   * it is ensured here (idempotent) at engine creation time.
   */
  private ensureDirectory(directory: string): void {
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
  }
}
