import {
  NeighStreet,
  Unit,
  UnitStatus,
  UnitType,
  User,
  UserRole,
  UserStatus,
  UserUnit,
  UserUnitRole,
} from '@core/database';
import { CryptoService } from '@core/services';
import { isProd } from '@core/utils';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UnitStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@nexhouse/shared-domain/enums';
import { generateRandomString } from '@nexhouse/shared-domain/utils';
import { CreateUnitDto } from '@administration/units/dtos';
import { CatalogsService } from 'src/catalogs/services';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { CreateResidentDto, UpdateUserDto } from '../dtos';
import { ResidentSearchService } from './resident-search.service';

@Injectable()
export class ResidentService {
  private readonly logger = new Logger(ResidentService.name);
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly catalogsService: CatalogsService,
    private readonly cryptoService: CryptoService,
    private readonly searchService: ResidentSearchService,
  ) {}

  /**
   * Creates a new resident with unit assignment within a single transaction.
   *
   * @param neighId Target neighborhood ID (must match the actor's neighborhood).
   * @param dto Resident payload including email, role, and unit assignment.
   * @param currentUser Authenticated actor creating the resident.
   * @throws ForbiddenException if the actor's neighborhood doesn't match neighId.
   * @throws ConflictException if the email is already registered.
   * @throws BadRequestException if the role catalog or unit role catalog is missing.
   */
  async create(
    neighId: number,
    dto: CreateResidentDto,
    currentUser: User,
  ): Promise<User> {
    if (neighId !== currentUser.neighborhoodId) {
      throw new ForbiddenException('Forbidden neighborhood scope.');
    }

    const formattedEmail = dto.email.trim().toLowerCase();
    const existsEmail = await this.repository.exists({
      where: { email: formattedEmail },
    });
    if (existsEmail) {
      throw new ConflictException(`Email ${dto.email} already in use.`);
    }

    // Resolve catalogs outside the transaction to minimize lock time.
    const role = await this.catalogsService.findByPublicId(
      UserRole,
      dto.userRoleId,
    );

    if (!role) {
      throw new BadRequestException('Target user role catalog not found.');
    }

    const status = await this.catalogsService.findByName(
      UserStatus,
      UserStatusEnum.PENDING_ONBOARDING,
    );

    if (!status) {
      throw new BadRequestException('Target user status catalog not found.');
    }

    const hashedPassword = await this.generateDefaultPassword();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nUser: DeepPartial<User> = {
        email: formattedEmail,
        role,
        status,
        createdBy: currentUser.id,
        neighborhoodId: neighId,
        password: hashedPassword,
        profile: {},
      };

      const newUser = queryRunner.manager.create(User, nUser);
      const savedUser = await queryRunner.manager.save(newUser);

      const targetUnit = await this.resolveOrCreateUnit(
        queryRunner.manager,
        dto.unit,
        neighId,
        currentUser.id,
      );

      const userUnitRole = await this.catalogsService.findByPublicId(
        UserUnitRole,
        dto.unit.unitRoleId,
      );

      if (!userUnitRole) {
        throw new BadRequestException('Target unit assignment role not found.');
      }

      const assignment = queryRunner.manager.create(UserUnit, {
        unitId: targetUnit.id,
        userId: savedUser.id,
        createdBy: currentUser.id,
        userUnitRole,
        isCurrentOccupant: dto.unit.isCurrentOccupant,
      });

      await queryRunner.manager.save(assignment);
      await queryRunner.commitTransaction();

      return this.searchService.findByPublicId(
        savedUser.publicId,
        neighId,
        { status: true, role: true },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `Transaction failed during resident creation: ${error.message}`,
      );

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Atomic operation failed during creation sequences.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Creates the first admin user for a new neighborhood.
   * Called from NeighborhoodService during neighborhood bootstrap.
   */
  async createFirstAdmin(
    neighId: number,
    email: string,
    creator: User,
    entityManager: EntityManager,
  ) {
    const hashedPassword = await this.generateDefaultPassword();

    const role = await this.catalogsService.findByName(
      UserRole,
      UserRoleEnum.ADMIN,
    );

    if (!role) {
      throw new BadRequestException(
        'Target admin role catalog not found.',
      );
    }

    const status = await this.catalogsService.findByName(
      UserStatus,
      UserStatusEnum.PENDING_ONBOARDING,
    );

    if (!status) {
      throw new BadRequestException(
        'Target admin status catalog not found.',
      );
    }

    const formattedEmail = email.trim().toLowerCase();
    const nUser: DeepPartial<User> = {
      email: formattedEmail,
      role,
      status,
      createdBy: creator.id,
      neighborhoodId: neighId,
      password: hashedPassword,
      isFirstAdmin: true,
      profile: {},
    };

    const newUser = entityManager.create(User, nUser);
    return entityManager.save(newUser);
  }

  /**
   * Updates an existing user profile and optionally modifies unit assignments.
   *
   * @param neighId Active neighborhood ID context.
   * @param userPublicId Public UUID of the resident to update.
   * @param dto Partial updates including role or unit assignment changes.
   * @param currentUser Actor performing the update.
   * @throws NotFoundException if the resident is not found in this neighborhood.
   * @throws BadRequestException if the new role or unit role catalog is missing.
   */
  async update(
    neighId: number,
    userPublicId: string,
    dto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const existingUser = await this.repository.findOne({
      where: { publicId: userPublicId, neighborhoodId: neighId },
      relations: {
        role: true,
        status: true,
        userUnits: { unit: true, userUnitRole: true },
      },
    });

    if (!existingUser) {
      throw new NotFoundException(
        'Target user profile not found in this neighborhood.',
      );
    }

    if (dto.userRoleId && dto.userRoleId !== existingUser.role?.publicId) {
      const role = await this.catalogsService.findByPublicId(
        UserRole,
        dto.userRoleId,
      );

      if (!role) {
        throw new BadRequestException('Target user role catalog not found.');
      }

      existingUser.role = role;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.unit) {
        await this.resolveUnitAssignment(
          queryRunner.manager,
          existingUser,
          dto.unit,
          neighId,
          currentUser,
        );
      }

      const savedUser = await queryRunner.manager.save(User, existingUser);

      await queryRunner.commitTransaction();
      return this.searchService.findByPublicId(
        savedUser.publicId,
        savedUser.neighborhoodId,
        {
          status: true,
          role: true,
        },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Transaction failed during resident update: ${error.message}`,
      );

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Atomic update operation failed.');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Synchronizes the user-unit allocation for an update, soft-removing the
   * previous assignment when the target changed.
   */
  private async resolveUnitAssignment(
    manager: EntityManager,
    user: User,
    unitDto: CreateUnitDto,
    neighId: number,
    currentUser: User,
  ): Promise<void> {
    const targetUnit = await this.resolveOrCreateUnit(
      manager,
      unitDto,
      neighId,
      currentUser.id,
    );

    const userUnitRole = await this.catalogsService.findByPublicId(
      UserUnitRole,
      unitDto.unitRoleId,
    );

    if (!userUnitRole) {
      throw new BadRequestException(
        'Target unit assignment role catalog not found.',
      );
    }

    const activeUserUnit =
      user.userUnits?.find((u) => u.isCurrentOccupant) ?? user.userUnits?.[0];

    // No-op when the assignment hasn't changed.
    if (
      activeUserUnit &&
      activeUserUnit.unit?.publicId === targetUnit.publicId &&
      activeUserUnit.userUnitRole?.publicId === userUnitRole.publicId &&
      activeUserUnit.isCurrentOccupant === (unitDto.isCurrentOccupant ?? true)
    ) {
      return;
    }

    if (activeUserUnit) {
      await manager.softRemove(activeUserUnit);
      user.userUnits = user.userUnits?.filter(
        (u) => u.id !== activeUserUnit.id,
      );
    }

    const assignment = manager.create(UserUnit, {
      unitId: targetUnit.id,
      userId: user.id,
      createdBy: currentUser.id,
      userUnitRole,
      isCurrentOccupant: unitDto.isCurrentOccupant ?? true,
    });

    const savedAssignment = await manager.save(UserUnit, assignment);

    if (!user.userUnits) {
      user.userUnits = [];
    }
    user.userUnits.push(savedAssignment);
  }

  /**
   * Resolves an existing unit or creates a new one when the target does not
   * exist within the neighborhood scope.
   *
   * @throws BadRequestException if the street, unit type, or unit status is missing,
   *   or if the required identifiers are absent.
   */
  private async resolveOrCreateUnit(
    manager: EntityManager,
    unitDto: CreateUnitDto,
    neighId: number,
    createdBy: number,
  ): Promise<Unit> {
    if (unitDto.unitId) {
      const unit = await manager.findOne(Unit, {
        where: { publicId: unitDto.unitId, neighborhoodId: neighId },
      });

      if (!unit) {
        throw new BadRequestException(
          'Target unit not found in this neighborhood.',
        );
      }

      return unit;
    }

    if (!unitDto.unitIdentifier) {
      throw new BadRequestException(
        'Invalid unit state allocation parameters.',
      );
    }

    const street = await manager.findOne(NeighStreet, {
      where: { publicId: unitDto.streetId, neighborhoodId: neighId },
    });

    if (!street) {
      throw new BadRequestException('Target neighborhood street not found.');
    }

    const unitType = await manager.findOne(UnitType, {
      where: { publicId: unitDto.unitTypeId },
    });

    if (!unitType) {
      throw new BadRequestException('Invalid unit type.');
    }

    const sanitizedIdentifier = unitDto.unitIdentifier.trim().toUpperCase();

    const existingUnit = await manager.findOne(Unit, {
      where: {
        identifier: sanitizedIdentifier,
        streetId: street.id,
        neighborhoodId: neighId,
      },
    });

    if (existingUnit) {
      return existingUnit;
    }

    const unitStatus = await manager.findOne(UnitStatus, {
      where: { name: UnitStatusEnum.OCCUPIED },
    });

    if (!unitStatus) {
      throw new BadRequestException('Invalid unit status.');
    }

    return manager.save(
      manager.create(Unit, {
        streetId: street.id,
        identifier: sanitizedIdentifier,
        neighborhoodId: neighId,
        typeId: unitType.id,
        statusId: unitStatus.id,
        createdBy,
      }),
    );
  }

  /**
   * Changes the password for a specific user (onboarding flow).
   *
   * @param publicId Public UUID of the user.
   * @param oldPassword Current password for verification.
   * @param newPassword New password to set.
   * @returns true if successful, false if validation fails.
   */
  async changePassword(
    publicId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.repository.findOne({ where: { publicId } });

    if (!user) {
      this.logger.warn(`User with public ID '${publicId}' not found.`);
      return false;
    }

    if (oldPassword === newPassword) {
      this.logger.warn(
        `Failed password change for user '${publicId}': new password cannot match the old password.`,
      );
      return false;
    }

    const isOldPasswordValid = await this.cryptoService.compare(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      this.logger.warn(
        `Failed password change for user '${publicId}': old password mismatch.`,
      );
      return false;
    }

    const hashedNewPassword = await this.cryptoService.hash(newPassword);

    user.password = hashedNewPassword;
    user.requirePwdChange = false;
    await this.repository.save(user);

    this.logger.log(`Password for user '${publicId}' successfully changed.`);
    return true;
  }

  /**
   * Resets a user's password to the default value.
   *
   * @param userId Internal numeric user ID.
   * @throws NotFoundException if the user is not found.
   */
  async restorePwd(userId: number): Promise<void> {
    const user = await this.repository.findOne({
      where: { id: Number(userId) },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID '${userId}' not found.`,
      );
    }

    const pwd = await this.generateDefaultPassword();
    user.password = pwd;
    await this.repository.save(user);
  }

  /**
   * Updates the avatar for a resident user.
   * TODO: implement blob storage integration for persistent avatar uploads.
   */
  async updateAvatar(
    userId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    avatar?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.repository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Resident not found.');
    }

    // TODO: persist avatar via StorageService when blob storage is integrated.
    // TODO: consider adding avatar field to UserProfile entity.

    return this.repository.findOne({ where: { id: userId } });
  }

  private async generateDefaultPassword(): Promise<string> {
    const pwd = isProd ? generateRandomString(10) : '1234';
    return this.cryptoService.hash(pwd);
  }
}