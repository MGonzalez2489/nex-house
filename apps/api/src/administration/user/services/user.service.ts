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
import {
  formatPhone,
  generateRandomString,
  validatePhone,
} from '@nexhouse/shared-domain/utils';
import { CatalogsService } from 'src/catalogs/services';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '../dtos';
import { UserSearchService } from './user-search.service';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly catalogsService: CatalogsService,
    private readonly cryptoService: CryptoService,
    private readonly searchService: UserSearchService,
    private readonly storageService: StorageService,
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
    dto: CreateUserDto,
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
    if (!role) {
      throw new BadRequestException(
        'Target user role catalog record not found.',
      );
    }

    const status = await this.catalogsService.findByName(
      UserStatus,
      UserStatusEnum.PENDING,
    );
    if (!status) {
      throw new BadRequestException(
        'Target pending user status catalog record not found.',
      );
    }

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
      };

      const newUser = queryRunner.manager.create(User, nUser);
      const savedUser = await queryRunner.manager.save(newUser);

      // Handle Unit resolution or creation
      let targetUnit: Unit | null = null;

      if (dto.unitId) {
        targetUnit = await queryRunner.manager.findOne(Unit, {
          where: { publicId: dto.unitId },
        });
      } else if (dto.unitIdentifier) {
        const street = await queryRunner.manager.findOne(NeighStreet, {
          where: { publicId: dto.streetId },
        });

        if (!street) {
          throw new BadRequestException(
            `Target neighborhood street not found.`,
          );
        }

        const unitType = await queryRunner.manager.findOne(UnitType, {
          where: { publicId: dto.unitTypeId },
        });

        if (!unitType) {
          throw new BadRequestException(`Invalid unit type.`);
        }

        const unitStatus = await queryRunner.manager.findOne(UnitStatus, {
          where: { name: UnitStatusEnum.OCCUPIED },
        });

        if (!unitStatus) {
          throw new BadRequestException(`Invalid unit status.`);
        }

        const newUnit = queryRunner.manager.create(Unit, {
          streetId: street.id,
          identifier: dto.unitIdentifier,
          neighborhoodId: neighId,
          typeId: unitType.id,
          statusId: unitStatus.id,
        });
        targetUnit = await queryRunner.manager.save(newUnit);
      }

      if (!targetUnit) {
        throw new BadRequestException(
          'Invalid unit state allocation parameters.',
        );
      }

      // Map dynamic relational role assignations
      const userUnitRole = await this.catalogsService.findByPublicId(
        UserUnitRole,
        dto.unitRoleId,
      );
      if (!userUnitRole) {
        throw new BadRequestException('Target unit assignment role not found.');
      }

      const assignment = queryRunner.manager.create(UserUnit, {
        unitId: targetUnit.id,
        userId: savedUser.id,
        createdBy: currentUser.id,
        userUnitRole,
        isCurrentOccupant: dto.isCurrentOccupant,
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
    if (!role) {
      throw new BadRequestException(
        'Target user role catalog record not found.',
      );
    }

    const status = await this.catalogsService.findByName(
      UserStatus,
      UserStatusEnum.PENDING,
    );
    if (!status) {
      throw new BadRequestException(
        'Target pending user status catalog record not found.',
      );
    }

    const formatedEmail = email.trim().toLowerCase();
    const nUser: DeepPartial<User> = {
      email: formatedEmail,
      role,
      status,
      createdBy: creator.id,
      neighborhoodId: neighId,
      password: hashedPassword,
      isFirstAdmin: true,
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
    const activeUserStatus = await this.catalogsService.findByName(
      UserStatus,
      UserStatusEnum.ACTIVE,
    );
    const existingUser = await this.repository.findOne({
      where: { publicId: userPublicId, neighborhoodId: neighId },
      relations: { role: true, status: true },
    });

    if (!existingUser) {
      throw new NotFoundException(
        'Target user profile not found in this neighborhood.',
      );
    }

    if (dto.phone) {
      const formatedPhone = formatPhone(dto.phone);
      if (formatedPhone !== existingUser.phone) {
        if (!validatePhone(formatedPhone)) {
          throw new BadRequestException('User phone format not valid.');
        }
        const existsPhone = await this.repository.exists({
          where: { phone: formatedPhone },
        });
        if (existsPhone) {
          throw new ConflictException(`Phone ${dto.phone} already in use.`);
        }
        existingUser.phone = formatedPhone;
      }
    }

    let updatedRole;
    if (dto.userRoleId && dto.userRoleId !== existingUser.role?.publicId) {
      const role = await this.catalogsService.findByPublicId(
        UserRole,
        dto.userRoleId,
      );
      if (!role) {
        throw new BadRequestException(
          'Target user role catalog record not found.',
        );
      }
      updatedRole = role;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.firstName) existingUser.firstName = dto.firstName.trim();
      if (dto.lastName) existingUser.lastName = dto.lastName.trim();
      if (updatedRole) existingUser.role = updatedRole;

      if (existingUser.statusId !== activeUserStatus.id) {
        existingUser.status = activeUserStatus;
      }

      const savedUser = await queryRunner.manager.save(User, existingUser);

      // Handle unit assignment updates if provided
      let targetUnit: Unit | null = null;

      if (dto.unitId) {
        targetUnit = await queryRunner.manager.findOne(Unit, {
          where: { publicId: dto.unitId },
        });
      } else if (dto.unitIdentifier) {
        const street = await queryRunner.manager.findOne(NeighStreet, {
          where: { publicId: dto.streetId },
        });

        if (!street) {
          throw new BadRequestException(
            'Target neighborhood street not found.',
          );
        }

        // Create new unit if it does not exist under that identifier
        const newUnit = queryRunner.manager.create(Unit, {
          streetId: street.id,
          identifier: dto.unitIdentifier,
          neighborhoodId: neighId,
        });
        targetUnit = await queryRunner.manager.save(newUnit);
      }

      //TODO: review this
      if (targetUnit) {
        const userUnitRole = await this.catalogsService.findByPublicId(
          UserUnitRole,
          dto.unitRoleId,
        );
        if (!userUnitRole) {
          throw new BadRequestException(
            'Target unit assignment role not found.',
          );
        }

        // Deactivate previous active unit allocations if necessary
        if (dto.isCurrentOccupant) {
          await queryRunner.manager.update(
            UserUnit,
            { userId: savedUser.id, isCurrentOccupant: true },
            { isCurrentOccupant: false },
          );
        }

        // Create the new assignment record
        const assignment = queryRunner.manager.create(UserUnit, {
          unitId: targetUnit.id,
          userId: savedUser.id,
          createdBy: currentUser.id,
          userUnitRole,
          isCurrentOccupant: dto.isCurrentOccupant,
        });

        await queryRunner.manager.save(assignment);
      }

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
   * Changes the password for a specific user.
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

    if (
      profile.avatar &&
      avatar &&
      !profile.avatar.includes('avatar-placeholder.webp')
    ) {
      this.storageService.deleteUploadFile(profile.avatar);
    }

    await this.repository.update(
      { id: profile.id },
      {
        avatar: avatar ? `uploads/${avatar.filename}` : profile.avatar, // avatar?.filename,
        // avatarFullPath: avatar ? avatar.path : '',
      },
    );

    return this.repository.findOne({ where: { id: userId } });
  }

  private async generateDefaultPassword() {
    const pwd = isProd ? generateRandomString(10) : '1234';
    return await this.cryptoService.hash(pwd);
  }
}
