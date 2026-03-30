import { CryptoService } from '@common/services';
import { User } from '@database/entities';
import { NeighborhoodsService } from '@modules/neighborhoods';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CryptoServiceMock } from '@test/mocks';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: any;
  let crypto: jest.Mocked<CryptoService>;

  const mockUser = {
    id: 1,
    publicId: 'user-uuid',
    email: 'manuel@nexhouse.com',
    password: 'hashed_password',
  } as User;

  const mockAdmin = { id: 99, email: 'admin@nexhouse.com' } as User;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest
      .fn()
      .mockImplementation((user) =>
        Promise.resolve({ ...user, publicId: 'new-uuid' }),
      ),
    merge: jest
      .fn()
      .mockImplementation((entity, dto) => ({ ...entity, ...dto })),
    softRemove: jest.fn().mockResolvedValue(undefined),
  };

  const mockCrypto = {
    hash: jest.fn().mockResolvedValue('hashed_password'),
  };

  const mockNeighborhoodService = {
    findByPublicId: jest.fn().mockResolvedValue({ id: 10, name: 'NexHouse' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: CryptoService,
          useValue: CryptoServiceMock,
        },
        {
          provide: NeighborhoodsService,
          useValue: {
            findByPublicId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
    crypto = module.get(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password and audit info', async () => {
      const dto = { email: 'new@test.com', password: 'plainPassword' };
      repo.findOne.mockResolvedValueOnce(null); // No existe el email
      repo.findOne.mockResolvedValueOnce(mockUser); // Para el findOrThrow final
      const hasshedPwd = 'hashed_password';

      crypto.hash.mockResolvedValue(hasshedPwd);
      const result = await service.create('nh-uuid', dto as any, mockAdmin);

      expect(crypto.hash).toHaveBeenCalledWith('plainPassword');
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: mockAdmin.id,
          password: hasshedPwd,
        }),
      );
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      await expect(
        service.create(
          'nh-uuid',
          { email: 'exists@test.com' } as any,
          mockAdmin,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user and set updatedBy', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      const dto = { firstName: 'Updated' };

      await service.update('user-uuid', dto as any, mockAdmin);

      expect(repo.merge).toHaveBeenCalledWith(
        mockUser,
        expect.objectContaining({
          updatedBy: mockAdmin.id,
        }),
      );
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should set deletedById and call softRemove', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      await service.remove('user-uuid', mockAdmin);

      expect(mockUser.deletedBy).toBe(mockAdmin.id);
      expect(repo.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove('wrong-uuid', mockAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
