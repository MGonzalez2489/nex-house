import { NxFile } from '@core/database';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs';
import { basename, extname, join, resolve } from 'path';
import { Repository } from 'typeorm';
import { resolveUploadsDir } from './storage.provider';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @InjectRepository(NxFile)
    private readonly repository: Repository<NxFile>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Persists the file, either creating a fresh `NxFile` record (no previous ID)
   * or replacing the stored file referenced by `prevFileId` — best-effort
   * removing the previous physical file once the new record is saved.
   */
  async uploadFile(
    url: string,
    file: Express.Multer.File,
    prevFileId?: number,
  ): Promise<NxFile> {
    const storageInfo = this.parseStorageUrl(url);

    if (!prevFileId) {
      return this.repository.save(
        this.repository.create({
          originalName: file.originalname,
          fileName: storageInfo.fileName,
          mimeType: file.mimetype,
          size: file.size,
          url,
          extension: storageInfo.extension,
        }),
      );
    }

    const existing = await this.repository.findOne({
      where: { id: prevFileId },
    });
    if (!existing) {
      throw new NotFoundException(`File with ID ${prevFileId} not found`);
    }

    if (existing.url === url) return existing;

    const previousUrl = existing.url;

    Object.assign(existing, {
      originalName: file.originalname,
      fileName: storageInfo.fileName,
      mimeType: file.mimetype,
      size: file.size,
      url,
      extension: storageInfo.extension,
    });

    const saved = await this.repository.save(existing);

    if (previousUrl && previousUrl !== url) {
      await this.deleteStoredFile(previousUrl).catch((error) => {
        this.logger.warn(
          `Could not remove previous stored file '${previousUrl}': ${error.message}`,
        );
      });
    }

    return saved;
  }

  /**
   * Removes the physical file resolved from a storage URL. Missing files
   * (`ENOENT`) are tolerated; other failures are logged and swallowed so
   * cleanup never fails the surrounding request.
   */
  async deleteStoredFile(storageUrl: string): Promise<void> {
    const filePath = this.resolveStoredFilePath(storageUrl);

    await new Promise<void>((res) => {
      unlink(filePath, (error) => {
        if (error && error.code !== 'ENOENT') {
          this.logger.warn(
            `Could not remove stored file '${storageUrl}': ${error.message}`,
          );
        }
        res();
      });
    });
  }

  /**
   * Maps `storageUrl` segments to an absolute path under the resolved uploads
   * root, tolerating an optional uploads-root prefix in the stored URL so
   * deletion always lands inside `<uploads-root>/avatars`.
   */
  private resolveStoredFilePath(storageUrl: string): string {
    const uploadsDir = resolveUploadsDir(this.configService);
    const root = resolve(uploadsDir);
    const segments = storageUrl.split(/[\\/]+/).filter(Boolean);
    const uploadsSegments = uploadsDir.split(/[\\/]+/).filter(Boolean);

    const isPrefixed =
      uploadsSegments.length > 0 &&
      uploadsSegments.every((segment, i) => segment === segments[i]);

    const relative = isPrefixed
      ? segments.slice(uploadsSegments.length)
      : segments;

    return join(root, ...relative);
  }

  /**
   * Extracts the stored `fileName` and a sanitized `extension` from a storage
   * URL (falling back to `bin` when no extension is present).
   */
  private parseStorageUrl(storageUrl: string): {
    fileName: string;
    extension: string;
  } {
    const fileName = basename(storageUrl);
    const extension = extname(fileName).replace('.', '') || 'bin';
    return { fileName, extension };
  }
}
