/* eslint-disable @typescript-eslint/no-explicit-any */
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
    // private readonly storageService: StorageService,
    // private readonly configService: ConfigService,
  ) {}

  /**
   * Orchestrates the secure registration of a user profile linked to a neighborhood,
   * optionally instantiating or assigning a physical housing unit within a database transaction.
   *
   * @param neighId Systemic database identifier for the target neighborhood scope.
   * @param dto Input payload containing user demographics, roles, and unit assignment metadata.
   * @param currentUser Active user session triggering the registration context.
   * @throws ForbiddenException if the targeted neighborhood falls outside the user's allowed scope.
   * @throws ConflictException if the email or phone number is already registered in the system.
   * @throws BadRequestException if the phone format is invalid or required relations are missing.
   * @returns The fully populated, newly registered User entity representation.
   */
  async create(
    neighId: number,
    dto: CreateResidentDto,
    currentUser: User,
  ): Promise<User> {
    // 1. Structural security and validation checks
    if (neighId !== currentUser.neighborhoodId) {
      throw new ForbiddenException('Forbidden neighborhood scope.');
    }

    const formatedEmail = dto.email.trim().toLowerCase();
    const existsEmail = await this.repository.exists({
      where: { email: formatedEmail },
    });
    if (existsEmail) {
      throw new ConflictException(`Email ${dto.email} already in use.`);
    }

    // 2. Resolve catalogs OUTSIDE the transaction to minimize database lock-time (Performance boost)
    const role = await this.catalogsService.findByPublicId(
      UserRole,
      dto.userRoleId,
    );

    const status = await this.catalogsService.findByName(
      UserStatus,
      UserStatusEnum.PENDING_ONBOARDING,
    );

    const hashedPassword = await this.generateDefaultPassword();

    // 3. Begin ACID Transaction block
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create and persist the new User entity
      const nUser: DeepPartial<User> = {
        email: formatedEmail,
        role,
        status,
        createdBy: currentUser.id,
        neighborhoodId: neighId,
        password: hashedPassword,
        profile: {},
      };

      const newUser = queryRunner.manager.create(User, nUser);
      const savedUser = await queryRunner.manager.save(newUser);

      // Handle Unit resolution or creation
      const targetUnit = await this.resolveOrCreateUnit(
        queryRunner.manager,
        dto.unit,
        neighId,
        currentUser.id,
      );

      // Map dynamic relational role assignations
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

      // TODO: Dispatch non-blocking background notifications of success
      // TODO: Log Systemic Activity

      // Fetch the unified structural state from the read-only service representation
      return await this.searchService.findByPublicId(
        savedUser.publicId,
        neighId,
        { status: true, role: true },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `🔴 Transaction failed during user instantiation pipeline: ${error.message}`,
      );

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
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

    const status = await this.catalogsService.findByName(
      UserStatus,
      UserStatusEnum.PENDING_ONBOARDING,
    );

    const formatedEmail = email.trim().toLowerCase();
    const nUser: DeepPartial<User> = {
      email: formatedEmail,
      role,
      status,
      createdBy: creator.id,
      neighborhoodId: neighId,
      password: hashedPassword,
      isFirstAdmin: true,
      profile: {},
    };

    const newUser = entityManager.create(User, nUser);
    return await entityManager.save(newUser);
  }

  /**
   * Updates an existing user profile and optionally modifies unit assignments.
   * Resolves unique constraint validations and manages atomic database states.
   * * @param neighId Active neighborhood identifier context.
   * @param userPublicId Public unique identifier of the user to be updated.
   * @param dto Partial updates including credentials, roles, or unit associations.
   * @param currentUser Actor session executing the update operation.
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
      return await this.searchService.findByPublicId(
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
        `🔴 Transaction failed during user update sequence: ${error.message}`,
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
   * Resolves the target unit for an assignment update and synchronizes the
   * user unit allocation without duplicating records.
   *
   * Reuses an existing unit when possible, creates a new one only when the
   * target does not exist, soft-deletes the previous allocation when the
   * assignment changed, and is a no-op when nothing changed.
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

    const activeUserUnit =
      user.userUnits?.find((u) => u.isCurrentOccupant) ?? user.userUnits?.[0];

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

    // await manager.save(assignment);

    const savedAssignment = await manager.save(UserUnit, assignment);

    // 3. Mantener sincronizado el objeto en memoria antes de guardar el User final
    if (!user.userUnits) {
      user.userUnits = [];
    }
    user.userUnits.push(savedAssignment);
  }

  /**
   * Resolves an existing unit or creates a new one when the target does not
   * exist, mirroring the assignment input without producing duplicates.
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
      where: { publicId: unitDto.streetId },
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
   * Changes the password for a specific user.
   * Used in the boarding process
   *
   * @param publicId The public ID of the user to update.
   * @param oldPassword The user's current password.
   * @param newPassword The new password to set.
   * @returns A promise that resolves to true if the password was successfully changed, false otherwise.
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
        `Failed password change for user '${publicId}': New password cannot be the same as the old password.`,
      );
      return false;
    }

    // Verify the old password
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

    // if (!this.cryptoService.isPasswordStrong(newPassword)) {
    //   this.logger.warn(
    //     `Failed password change for user '${publicId}': New password does not meet strength requirements.`,
    //   );
    //   return false;
    // }

    // Hash the new password
    const hashedNewPassword = await this.cryptoService.hash(newPassword);

    // Update and save the user
    user.password = hashedNewPassword;
    user.requirePwdChange = false;
    await this.repository.save(user);

    this.logger.log(`Password for user '${publicId}' successfully changed.`);
    return true;
  }

  async restorePwd(userId: number) {
    const user = await this.repository.findOne({
      where: { id: Number(userId) },
    });
    const pwd = await this.cryptoService.hash('1234');
    user.password = pwd;
    await this.repository.save(user);
  }

  async updateAvatar(userId: number, avatar?: Express.Multer.File) {
    const profile = await this.repository.findOne({ where: { id: userId } });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    //TODO: use a default avatar img and make (?) user.avatar not null
    //TODO: Think on a blob storage to handle uploads

    //TODO: move this to profile
    // if (
    //   profile.avatar &&
    //   avatar &&
    //   !profile.avatar.includes('avatar-placeholder.webp')
    // ) {
    //   this.storageService.deleteUploadFile(profile.avatar);
    // }
    // const url = this.configService.get('UPLOAD_DIR');
    // const avatarPath = getAvatarFolderRelativePath(url, avatar.filename);
    // await this.repository.update(
    //   { id: profile.id },
    //   {
    //     avatar: avatar ? `${avatarPath}` : profile.avatar, // avatar?.filename,
    //   },
    // );

    return this.repository.findOne({ where: { id: userId } });
  }

  private async generateDefaultPassword() {
    const pwd = isProd ? generateRandomString(10) : '1234';
    return await this.cryptoService.hash(pwd);
  }
}
