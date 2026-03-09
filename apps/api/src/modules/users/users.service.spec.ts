import { User } from '@database/entities';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(), // Necesario para el helper de paginate
    merge: jest.fn(),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user', async () => {
    const dto = {
      email: 'test@nex.house',
      password: 'password123',
      firstName: 'M',
      lastName: 'G',
    };
    mockRepository.findOne.mockResolvedValue(null);

    const result = await service.create(dto as any, dto.password);

    expect(result.password).not.toBe('password123'); // Verifica que se hasheó
    expect(repo.save).toHaveBeenCalled();
  });
});
