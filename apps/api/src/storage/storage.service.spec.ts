import { NxFile } from '@core/database';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { tmpdir } from 'os';
import { join } from 'path';
import { StorageService } from './storage.service';

const createConfigService = (value?: string): ConfigService =>
  ({
    get: jest.fn().mockReturnValue(value),
  }) as unknown as ConfigService;

const buildFile = (): Express.Multer.File =>
  ({
    originalname: 'photo.jpg',
    mimetype: 'image/jpeg',
    size: 2048,
  }) as Express.Multer.File;

const testUploadsRoot = join(tmpdir(), 'nexhouse-storage-service-test');
const buildUrl = (fileName: string): string => `uploads/avatars/${fileName}`;

describe('StorageService', () => {
  let service: StorageService;
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: createConfigService(testUploadsRoot) },
        { provide: getRepositoryToken(NxFile), useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates and saves a new NxFile record when no previous file is given', async () => {
    const fileName = 'uuid-1.jpg';
    const storageUrl = buildUrl(fileName);
    const created = {
      id: 1,
      originalName: 'photo.jpg',
      fileName,
      mimeType: 'image/jpeg',
      size: 2048,
      url: storageUrl,
      extension: 'jpg',
    };
    repository.create.mockReturnValue(created);
    repository.save.mockResolvedValue(created);

    const result = await service.uploadFile(storageUrl, buildFile());

    expect(repository.create).toHaveBeenCalledWith({
      originalName: 'photo.jpg',
      fileName,
      mimeType: 'image/jpeg',
      size: 2048,
      url: storageUrl,
      extension: 'jpg',
    });
    expect(repository.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });

  it('throws NotFoundException when the previous file does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.uploadFile(buildUrl('uuid-2.jpg'), buildFile(), 42),
    ).rejects.toThrow(NotFoundException);
  });

  it('tolerates a missing stored file and still resolves', async () => {
    await expect(
      service.deleteStoredFile(buildUrl('missing.jpg')),
    ).resolves.toBeUndefined();
  });
});
