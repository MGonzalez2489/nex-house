/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { of } from 'rxjs';
import { NeighborhoodInterceptor } from './neighborhood.interceptor';
import { Neighborhood } from '@core/database';

describe('NeighborhoodInterceptor', () => {
  let interceptor: NeighborhoodInterceptor;
  let mockRepository: jest.Mocked<Repository<Neighborhood>>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let mockRequest: any;

  const mockNeighborhood = {
    id: 1,
    publicId: 'neigh-uuid-123',
    name: 'Residencial NexHouse',
    isActive: true,
  } as Neighborhood;

  beforeEach(async () => {
    mockRepository = {
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<Neighborhood>>;

    mockRequest = {
      params: {},
      headers: {},
    };

    // Mock anidated hierarchy for ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as unknown as jest.Mocked<ExecutionContext>;

    // Mock CallHandler execution stream
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('interceptor-passed')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeighborhoodInterceptor,
        {
          provide: getRepositoryToken(Neighborhood),
          useValue: mockRepository,
        },
      ],
    }).compile();

    interceptor = module.get<NeighborhoodInterceptor>(NeighborhoodInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass transparently through the stream if neighborhoodId parameter is missing', async () => {
    mockRequest.params = {}; // No neighborhoodId

    const stream$ = await interceptor.intercept(
      mockExecutionContext,
      mockCallHandler,
    );

    stream$.subscribe((result) => {
      expect(result).toBe('interceptor-passed');
    });

    expect(mockRepository.findOneBy).not.toHaveBeenCalled();
    expect(mockRequest['neighborhood']).toBeUndefined();
  });

  it('should inject the neighborhood instance into the request context if target ID matches', async () => {
    mockRequest.params = { neighborhoodId: 'neigh-uuid-123' };
    mockRepository.findOneBy.mockResolvedValue(mockNeighborhood);

    const stream$ = await interceptor.intercept(
      mockExecutionContext,
      mockCallHandler,
    );

    stream$.subscribe((result) => {
      expect(result).toBe('interceptor-passed');
    });

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      publicId: 'neigh-uuid-123',
    });
    expect(mockRequest['neighborhood']).toEqual(mockNeighborhood);
  });

  it('should throw NotFoundException if repository fetch resolves to null or empty bounds', async () => {
    mockRequest.params = { neighborhoodId: 'invalid-id' };
    mockRepository.findOneBy.mockResolvedValue(null);

    await expect(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).rejects.toThrow(
      new NotFoundException('Neighborhood with ID "invalid-id" not found.'),
    );

    expect(mockRequest['neighborhood']).toBeUndefined();
  });
});

// import { NeighborhoodInterceptor } from './neighborhood.interceptor';
//
// describe('NeighborhoodInterceptor', () => {
//   it('should be defined', () => {
//     expect(new NeighborhoodInterceptor()).toBeDefined();
//   });
// });
