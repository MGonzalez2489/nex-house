import { Test, TestingModule } from '@nestjs/testing';
import { Neighborhood, Unit, User } from '@core/database';
import { SearchDto } from '@core/dtos';
import { UnitStats } from '@nexhouse/shared-domain/interfaces';
import { CreateUnitDto } from '../dtos';
import { UnitSearchService, UnitService } from '../services';
import { UnitsController } from './units.controller';

describe('UnitsController', () => {
  let controller: UnitsController;
  let mockUnitService: jest.Mocked<UnitService>;
  let mockSearchService: jest.Mocked<UnitSearchService>;

  const currentNeigh = { id: 10 } as Neighborhood;
  const currentUser = { id: 1 } as User;

  const mockUnit = {
    id: 1,
    publicId: 'unit-uuid',
    identifier: 'A-101',
    type: null,
    street: null,
    userUnits: [],
  } as unknown as Unit;

  const mockDto: CreateUnitDto = {
    unitIdentifier: 'a-101',
    streetId: 'street-uuid',
    unitTypeId: 'type-uuid',
    unitRoleId: 'role-uuid',
    isCurrentOccupant: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockUnitService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<UnitService>;

    mockSearchService = {
      findAll: jest.fn(),
      findStats: jest.fn(),
    } as unknown as jest.Mocked<UnitSearchService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [
        { provide: UnitService, useValue: mockUnitService },
        { provide: UnitSearchService, useValue: mockSearchService },
      ],
    }).compile();

    controller = module.get<UnitsController>(UnitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to UnitService with the neighborhood and actor ids', async () => {
      mockUnitService.create.mockResolvedValueOnce(mockUnit);

      const result = await controller.create(mockDto, currentNeigh, currentUser);

      expect(mockUnitService.create).toHaveBeenCalledWith(
        currentNeigh.id,
        mockDto,
        currentUser.id,
      );
      expect(result).toBe(mockUnit);
    });
  });

  describe('findAll', () => {
    it('maps the paginated units to models', async () => {
      const meta = { total: 1, page: 1, lastPage: 1, limit: 10 };
      mockSearchService.findAll.mockResolvedValueOnce({
        data: [mockUnit],
        meta,
      });

      const dto: SearchDto = Object.assign(new SearchDto(), { first: 0, rows: 10 });
      const result = await controller.findAll(dto, currentNeigh);

      expect(mockSearchService.findAll).toHaveBeenCalledWith(dto, currentNeigh.id);
      expect(result.meta).toEqual(meta);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].publicId).toBe(mockUnit.publicId);
    });
  });

  describe('findStats', () => {
    it('delegates to UnitSearchService with the neighborhood id', async () => {
      const stats: UnitStats = {
        summary: { totalUnits: 3 },
        byStatus: { Ocupado: 3 },
        byType: { Casa: 3 },
        byStreet: { roma: 3 },
      };
      mockSearchService.findStats.mockResolvedValueOnce(stats);

      const result = await controller.findStats(currentNeigh);

      expect(mockSearchService.findStats).toHaveBeenCalledWith(currentNeigh.id);
      expect(result).toEqual(stats);
    });
  });
});
