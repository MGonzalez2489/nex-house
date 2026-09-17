import { getAvatarFolderFullPath } from '@core/utils';
import { ConfigService } from '@nestjs/config';
import { existsSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  DEFAULT_UPLOAD_DIR,
  resolveUploadsDir,
  StorageProvider,
  UPLOAD_DIR_ENV_KEY,
} from './storage.provider';

const createConfigService = (config?: string): ConfigService =>
  ({
    get: jest.fn().mockReturnValue(config),
  }) as unknown as ConfigService;

describe('StorageProvider', () => {
  const testUploadsRoot = join(tmpdir(), 'nexhouse-uploads-provider-test');

  afterAll(() => {
    rmSync(testUploadsRoot, { recursive: true, force: true });
  });

  describe('resolveUploadsDir', () => {
    it('defaults to `uploads` when the environment value is not configured', () => {
      expect(resolveUploadsDir(createConfigService(undefined))).toBe(
        DEFAULT_UPLOAD_DIR,
      );
    });

    it('returns the configured uploads root', () => {
      expect(resolveUploadsDir(createConfigService('/tmp/custom-uploads'))).toBe(
        '/tmp/custom-uploads',
      );
    });

    it('reads the `UPLOAD_DIR` environment key', () => {
      const configService = createConfigService('test-uploads');

      resolveUploadsDir(configService);

      expect(configService.get).toHaveBeenCalledWith(UPLOAD_DIR_ENV_KEY);
    });
  });

  describe('StorageProvider', () => {
    it('builds a multer disk storage engine and creates the avatars folder', () => {
      const provider = new StorageProvider(
        createConfigService(testUploadsRoot),
      );

      const engine = provider.getMulterStorage();

      expect(engine).toBeDefined();
      expect(typeof engine._handleFile).toBe('function');
      expect(typeof engine._removeFile).toBe('function');
      expect(
        existsSync(getAvatarFolderFullPath(testUploadsRoot, '')),
      ).toBe(true);
    });
  });
});
