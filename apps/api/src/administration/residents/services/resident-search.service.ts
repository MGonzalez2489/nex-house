import { User } from '@core/database';
import { PaginatedResult, paginateQuery } from '@core/utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';
import {
  Brackets,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { SearchUserDto } from '../dtos';

@Injectable()
export class ResidentSearchService {
  private readonly defaultRelations: FindOptionsRelations<User> = {
    neighborhood: true,
  };

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  /**
   * Retrieves raw user entities for internal processing.
   */
  async findAll(
    neighborhoodId: number,
    filters: SearchUserDto,
    options: { raw: true },
  ): Promise<User[]>;

  /**
   * Retrieves a paginated list of users with metadata headers.
   */
  async findAll(
    neighborhoodId: number,
    filters: SearchUserDto,
    options?: { raw?: false },
  ): Promise<PaginatedResult<User>>;

  async findAll(
    neighborhoodId: number,
    filters: SearchUserDto,
    options?: { raw?: boolean },
  ): Promise<PaginatedResult<User> | User[]> {
    const query = this.repository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.neighborhood', 'neighborhood')
      .leftJoinAndSelect('users.status', 'status')
      .leftJoinAndSelect('users.profile', 'profile')
      .leftJoinAndSelect('users.role', 'role')
      .leftJoinAndSelect('users.userUnits', 'userUnits')
      .leftJoinAndSelect('userUnits.unit', 'unit')
      .leftJoinAndSelect('userUnits.userUnitRole', 'userUnitRole')
      .leftJoinAndSelect('unit.street', 'street')
      .leftJoinAndSelect('unit.type', 'unitType')
      .where('neighborhood.id = :neighborhoodId', {
        neighborhoodId,
      });

    const { globalFilter, role, status } = filters;

    if (role) {
      query.andWhere('role.name = :role', { role });
    }
    if (status) {
      query.andWhere('status.name = :status', { status });
    }

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
                    .where(`profile.firstName LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`profile.lastName LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`users.email LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`profile.phone LIKE :${paramName}`, {
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
      `CASE role.name WHEN '${UserRoleEnum.ADMIN}' THEN 1 WHEN '${UserRoleEnum.RESIDENT}' THEN 2 ELSE 3 END`,
      'roleOrder',
    );
    query.addOrderBy('roleOrder', 'ASC');
    query.addOrderBy('profile.firstName', 'ASC');
    query.addOrderBy('profile.lastName', 'ASC');

    const result = await paginateQuery(query, filters);

    if (options?.raw === true) {
      return result.data;
    }

    return result;
  }

  /**
   * Finds a user by publicId with optional neighborhood scope and custom relations.
   */
  async findByPublicId(
    publicId: string,
    neighborhoodId?: number,
    relations?: FindOptionsRelations<User>,
  ): Promise<User | null> {
    return this.findOneByCriteria({ publicId }, neighborhoodId, relations);
  }

  /**
   * Finds a user by publicId or throws NotFoundException.
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
   * Finds a user by email with optional neighborhood scope and custom relations.
   */
  async findByEmail(
    email: string,
    neighborhoodId?: number,
    relations?: FindOptionsRelations<User>,
  ): Promise<User | null> {
    return this.findOneByCriteria({ email }, neighborhoodId, relations);
  }

  /**
   * Finds a user by email or throws NotFoundException.
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