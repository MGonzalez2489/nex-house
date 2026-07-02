import { User } from '@core/database';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  Repository,
  FindOptionsWhere,
  Brackets,
} from 'typeorm';
import { SearchUserDto } from '../dtos';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';
import { PaginatedResult, paginateQuery } from '@core/utils';

@Injectable()
export class UserSearchService {
  private readonly logger = new Logger(UserSearchService.name);

  /**
   * Default relations to load when no custom relations are provided.
   */
  private readonly defaultRelations: FindOptionsRelations<User> = {
    neighborhood: true,
  };

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  /**
   * Retrieves a raw array of User entities for internal business logic processing.
   * Activated by passing `{ raw: true }` in the options argument.
   *
   * @param neighborhoodId The context neighborhood identifier.
   * @param filters Filtering criteria.
   * @param options Execution configuration flags.
   * @returns A promise that resolves to an array of User entities.
   */
  async findAll(
    neighborhoodId: number,
    filters: SearchUserDto,
    options: { raw: true },
  ): Promise<User[]>;

  /**
   * Retrieves a paginated matrix of users including API metadata headers.
   * Standard execution path used by API controllers.
   *
   * @param neighborhoodId The context neighborhood identifier.
   * @param filters Filtering and pagination bounds.
   * @param options Optional execution configuration flags.
   * @returns A promise that resolves to a structured PaginatedResult.
   */
  async findAll(
    neighborhoodId: number,
    filters: SearchUserDto,
    options?: { raw?: false },
  ): Promise<PaginatedResult<User>>;

  /**
   * Core implementation handling conditional filters, global search parsing, and dynamic formatting.
   */
  async findAll(
    neighborhoodId: number,
    filters: SearchUserDto,
    options?: { raw?: boolean },
  ): Promise<PaginatedResult<User> | User[]> {
    const query = this.repository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.neighborhood', 'neighborhood')
      .leftJoinAndSelect('users.units', 'units')
      .leftJoinAndSelect('units.unit', 'unit')
      .leftJoinAndSelect('unit.street', 'street')
      .where('neighborhood.id = :neighborhoodId', {
        neighborhoodId,
      });

    const { globalFilter, role, status } = filters;

    if (role) {
      query.andWhere('users.role = :role', { role });
    }
    if (status) {
      query.andWhere('users.status = :status', { status });
    }
    //TODO: analize if street should be an ID

    if (globalFilter) {
      const globalFilterWords = globalFilter
        .split(' ')
        .filter((word) => word.length > 0);

      if (globalFilterWords.length > 0) {
        query.andWhere(
          new Brackets((andQb) => {
            globalFilterWords.forEach((word, index) => {
              const paramName = `globalFilterWord${index}`;
              andQb.andWhere(
                new Brackets((orQb) => {
                  orQb
                    .where(`users.firstName LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`users.lastName LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`users.email LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`users.phone LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`street.name LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`unit.identifier LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    });
                }),
              );
            });
          }),
        );
      }
    }

    query.addSelect(
      `CASE users.role WHEN '${UserRoleEnum.ADMIN}' THEN 1 WHEN '${UserRoleEnum.RESIDENT}' THEN 2 ELSE 3 END`,
      'roleOrder',
    );
    query.addOrderBy('roleOrder', 'ASC');
    query.addOrderBy('users.firstName', 'ASC');
    query.addOrderBy('users.lastName', 'ASC');

    const result = await paginateQuery(query, filters);

    if (options?.raw === true) {
      return result.data;
    }

    return result;
  }

  /**
   * Finds a user by their publicId with optional custom relations.
   *
   * @param publicId The unique public identifier of the user.
   * @param neighborhoodId Optional neighborhood context identifier.
   * @param relations Optional custom entity relations to load. Passes default relations if omitted.
   * @returns A promise that resolves to the User entity or null if not found.
   */
  async findByPublicId(
    publicId: string,
    neighborhoodId?: number,
    relations?: FindOptionsRelations<User>,
  ): Promise<User | null> {
    return this.findOneByCriteria({ publicId }, neighborhoodId, relations);
  }

  /**
   * Finds a user by their publicId or throws a NotFoundException if they do not exist.
   *
   * @param publicId The unique public identifier of the user.
   * @param neighborhoodId Optional neighborhood context identifier.
   * @param relations Optional custom entity relations to load. Passes default relations if omitted.
   * @throws NotFoundException if the user is not found.
   * @returns A promise that resolves to the User entity.
   */
  async findByPublicIdOrThrow(
    publicId: string,
    neighborhoodId?: number,
    relations?: FindOptionsRelations<User>,
  ): Promise<User> {
    const user = await this.findByPublicId(publicId, neighborhoodId, relations);
    if (!user) {
      throw new NotFoundException(
        `User with public ID '${publicId}' not found`,
      );
    }
    return user;
  }

  /**
   * Finds a user by their email address with optional custom relations.
   *
   * @param email The unique email address of the user.
   * @param neighborhoodId Optional neighborhood context identifier.
   * @param relations Optional custom entity relations to load. Passes default relations if omitted.
   * @returns A promise that resolves to the User entity or null if not found.
   */
  async findByEmail(
    email: string,
    neighborhoodId?: number,
    relations?: FindOptionsRelations<User>,
  ): Promise<User | null> {
    return this.findOneByCriteria({ email }, neighborhoodId, relations);
  }

  /**
   * Finds a user by their email address or throws a NotFoundException if they do not exist.
   *
   * @param email The unique email address of the user.
   * @param neighborhoodId Optional neighborhood context identifier.
   * @param relations Optional custom entity relations to load. Passes default relations if omitted.
   * @throws NotFoundException if the user is not found.
   * @returns A promise that resolves to the User entity.
   */
  async findByEmailOrThrow(
    email: string,
    neighborhoodId?: number,
    relations?: FindOptionsRelations<User>,
  ): Promise<User> {
    const user = await this.findByEmail(email, neighborhoodId, relations);
    if (!user) {
      throw new NotFoundException(`User with email '${email}' not found`);
    }
    return user;
  }

  /**
   * Centralized private method to execute user lookups with dynamic criteria and relations.
   */
  private async findOneByCriteria(
    criteria: FindOptionsWhere<User>,
    neighborhoodId?: number,
    relations?: FindOptionsRelations<User>,
  ): Promise<User | null> {
    const whereCondition: FindOptionsWhere<User> = { ...criteria };

    if (neighborhoodId !== undefined) {
      whereCondition.neighborhood = { id: neighborhoodId };
    }

    return this.repository.findOne({
      where: whereCondition,
      relations: relations ?? this.defaultRelations,
    });
  }
}
