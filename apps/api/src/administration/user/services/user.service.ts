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
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CatalogsService } from 'src/catalogs/services';
import { DataSource, IsNull, Repository } from 'typeorm';
import { UpdateUserDto } from '../dtos';
import { UserSearchService } from './user-search.service';
import { UnitStatusEnum, UserStatusEnum } from '@nexhouse/shared-domain/enums';

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
  ) {}

  /**
   * Updates an existing user profile and optionally modifies unit assignments.
   * Resolves unique constraint validations and manages atomic database states.
   *
   * @param neighId Active neighborhood identifier context.
   * @param userPublicId Public unique identifier of the user to be updated.
   * @param dto Partial updates including role, recovery payloads or unit associations.
   * @param currentUser Actor session executing the update operation.
   * @returns The persisted user reloaded with status and role relations.
   *
   * @throws {NotFoundException} If the user, target unit or street is not found in scope.
   * @throws {BadRequestException} If a recovery/unit payload is inconsistent.
   * @throws {InternalServerErrorException} If an unexpected database error occurs.
   */
  async update(
    neighId: number,
    userPublicId: string,
    dto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const existingUser = await this.repository.findOne({
      where: { publicId: userPublicId, neighborhoodId: neighId ?? IsNull() },
      relations: { role: true, status: true },
    });

    if (!existingUser) {
      throw new NotFoundException(
        'Target user profile not found in this neighborhood.',
      );
    }

    let updatedRole: UserRole | undefined;
    if (dto.userRoleId && dto.userRoleId !== existingUser.role?.publicId) {
      updatedRole = await this.catalogsService.findByPublicId(
        UserRole,
        dto.userRoleId,
      );
    }

    // Step 1 of the recovery flow sends both fields together; step 2 only
    // sends the token. Receiving only one of the pair is a malformed request.
    if (dto.recoveryCode && !dto.recoveryCodeExpiration) {
      throw new BadRequestException(
        'No expiration date provided for recovery code.',
      );
    }
    if (!dto.recoveryCode && dto.recoveryCodeExpiration) {
      throw new BadRequestException('No recovery code for expiration date.');
    }

    // Only touch recovery fields/status when a recovery payload is explicitly
    // provided, so regular profile updates and the token-only step of the
    // recovery flow do not wipe the data stored in step 1.
    if (dto.recoveryCode && dto.recoveryCodeExpiration) {
      const recoveryStatus = await this.catalogsService.findByName(
        UserStatus,
        UserStatusEnum.PASSWORD_RECOVERY,
      );
      existingUser.recoveryCode = dto.recoveryCode;
      existingUser.recoveryCodeExpiration = dto.recoveryCodeExpiration;
      existingUser.status = recoveryStatus;
    }
    if (dto.recoveryToken) {
      existingUser.recoveryToken = dto.recoveryToken;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (updatedRole) existingUser.role = updatedRole;

      const savedUser = await queryRunner.manager.save(User, existingUser);

      if (dto.unit?.unitId || dto.unit?.unitIdentifier) {
        const targetUnit = await this.resolveTargetUnit(
          queryRunner,
          neighId,
          dto,
          currentUser.id,
        );

        const userUnitRole = await this.catalogsService.findByPublicId(
          UserUnitRole,
          dto.unit.unitRoleId,
        );

        // Deactivate previous active unit allocations when the new link
        // represents the current occupant.
        if (dto.unit.isCurrentOccupant) {
          await queryRunner.manager.update(
            UserUnit,
            { userId: savedUser.id, isCurrentOccupant: true },
            { isCurrentOccupant: false },
          );
        }

        const assignment = queryRunner.manager.create(UserUnit, {
          unitId: targetUnit.id,
          userId: savedUser.id,
          createdBy: currentUser.id,
          userUnitRole,
          isCurrentOccupant: dto.unit.isCurrentOccupant,
        });

        await queryRunner.manager.save(assignment);
      }

      await queryRunner.commitTransaction();
      return await this.searchService.findByPublicId(
        savedUser.publicId,
        savedUser.neighborhoodId || undefined,
        {
          status: true,
          role: true,
        },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Transaction failed during user update sequence: ${error.message}`,
      );

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Atomic update operation failed.');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Resolves the unit referenced by an update payload, either by loading an
   * existing unit or by creating a new one inside the neighborhood.
   *
   * @param queryRunner Active transaction runner.
   * @param neighId Active neighborhood identifier context.
   * @param dto Update payload carrying the unit reference.
   * @param currentUserId Internal id of the acting user, stored as audit trail.
   * @returns The existing or newly created unit.
   *
   * @throws {NotFoundException} If the referenced unit or street does not exist in scope.
   * @throws {BadRequestException} If the payload is missing the unit type.
   */
  private async resolveTargetUnit(
    queryRunner: ReturnType<DataSource['createQueryRunner']>,
    neighId: number,
    dto: UpdateUserDto,
    currentUserId: number,
  ): Promise<Unit> {
    if (dto.unit.unitId) {
      const unit = await queryRunner.manager.findOne(Unit, {
        where: { publicId: dto.unit.unitId, neighborhoodId: neighId },
      });

      if (!unit) {
        throw new NotFoundException(
          'Target unit not found in this neighborhood.',
        );
      }

      return unit;
    }

    const { unitIdentifier, streetId, unitTypeId } = dto.unit;

    if (!unitIdentifier) {
      throw new BadRequestException('Unit identifier is required.');
    }
    if (!streetId || !unitTypeId) {
      throw new BadRequestException(
        'Unit creation requires street and unit type references.',
      );
    }

    const street = await queryRunner.manager.findOne(NeighStreet, {
      where: { publicId: streetId, neighborhoodId: neighId },
    });

    if (!street) {
      throw new NotFoundException(
        'Target neighborhood street not found in this neighborhood.',
      );
    }

    const [unitType, unitStatus] = await Promise.all([
      this.catalogsService.findByPublicId(UnitType, unitTypeId),
      this.catalogsService.findByName(UnitStatus, UnitStatusEnum.OCCUPIED),
    ]);

    const newUnit = queryRunner.manager.create(Unit, {
      streetId: street.id,
      identifier: unitIdentifier.trim().toUpperCase(),
      neighborhoodId: neighId,
      typeId: unitType.id,
      statusId: unitStatus.id,
      createdBy: currentUserId,
    });

    return queryRunner.manager.save(newUnit);
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
   * Finalizes a password recovery by storing the new password and clearing the
   * recovery state, restoring the user to the ACTIVE status.
   *
   * @param id Internal id of the user being recovered.
   * @param newPwd Plain text password to hash and persist.
   */
  async updatePasswordOnRecoveryProcess(
    id: number,
    newPwd: string,
  ): Promise<void> {
    const [hashedPwd, activeStatus] = await Promise.all([
      this.cryptoService.hash(newPwd),
      this.catalogsService.findByName(UserStatus, UserStatusEnum.ACTIVE),
    ]);

    await this.repository.update(id, {
      password: hashedPwd,
      statusId: activeStatus.id,
      recoveryCode: null,
      recoveryCodeExpiration: null,
      recoveryToken: null,
    });
  }

  /**
   * Clears any pending recovery state and restores the user to ACTIVE, used
   * when a user logs in successfully while a recovery was in progress.
   *
   * @param id Internal id of the user.
   */
  async cleanPwdRecoveryState(id: number): Promise<void> {
    const status = await this.catalogsService.findByName(
      UserStatus,
      UserStatusEnum.ACTIVE,
    );

    await this.repository.update(id, {
      statusId: status.id,
      recoveryCode: null,
      recoveryCodeExpiration: null,
      recoveryToken: null,
    });
  }
}
