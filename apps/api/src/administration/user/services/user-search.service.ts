import { User } from '@core/database';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository, FindOptionsWhere } from 'typeorm';

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
