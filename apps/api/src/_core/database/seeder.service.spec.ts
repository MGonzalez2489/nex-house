import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { DatabaseSeederService } from './seeder.service';

describe('DatabaseSeederService', () => {
  let service: DatabaseSeederService;
  let mockEntityManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    mockEntityManager = {
      count: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseSeederService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<DatabaseSeederService>(DatabaseSeederService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => null);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should seed catalogs that are completely empty (count === 0)', async () => {
    mockEntityManager.count.mockResolvedValue(0);
    mockEntityManager.save.mockResolvedValue([] as any);

    await service.onApplicationBootstrap();

    expect(mockEntityManager.count).toHaveBeenCalledTimes(10);
    expect(mockEntityManager.save).toHaveBeenCalledTimes(10);
  });

  it('should bypass seeding if catalogs already contain records (count > 0)', async () => {
    mockEntityManager.count.mockResolvedValue(5);

    await service.onApplicationBootstrap();

    expect(mockEntityManager.count).toHaveBeenCalledTimes(10);
    expect(mockEntityManager.save).not.toHaveBeenCalled();
  });

  it('should isolate errors gracefully inside the loop if a catalog seeding execution fails', async () => {
    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

    mockEntityManager.count.mockRejectedValueOnce(
      new Error('Connection timeout deadlock'),
    );
    mockEntityManager.count.mockResolvedValue(5);

    await expect(service.onApplicationBootstrap()).resolves.not.toThrow();

    expect(mockEntityManager.count).toHaveBeenCalledTimes(10);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('🔴 Error seeding catalog'),
      'Connection timeout deadlock',
    );
  });
});
