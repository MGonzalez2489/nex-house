import {
  NeighStreet,
  Unit,
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
import { UserStatusEnum } from '@nexhouse/shared-domain/enums';

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
    //TODO: review this
    // const activeUserStatus = await this.catalogsService.findByName(
    //   UserStatus,
    //   UserStatusEnum.ACTIVE,
    // );
    const existingUser = await this.repository.findOne({
      where: { publicId: userPublicId, neighborhoodId: neighId ?? IsNull() },
      relations: { role: true, status: true },
    });

    if (!existingUser) {
      throw new NotFoundException(
        'Target user profile not found in this neighborhood.',
      );
    }

    let updatedRole: UserRole;
    if (dto.userRoleId && dto.userRoleId !== existingUser.role?.publicId) {
      const role = await this.catalogsService.findByPublicId(
        UserRole,
        dto.userRoleId,
      );

      updatedRole = role;
    }

    //pass recovery validations
    if (dto.recoveryCode && !dto.recoveryCodeExpiration) {
      throw new InternalServerErrorException(
        'No expiration date provided for recovery code.',
      );
    } else if (!dto.recoveryCode && dto.recoveryCodeExpiration) {
      throw new InternalServerErrorException(
        'No recovery code for expiration date.',
      );
    } else {
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

      // Handle unit assignment updates if provided
      let targetUnit: Unit | null = null;

      if (dto.unit?.unitId) {
        targetUnit = await queryRunner.manager.findOne(Unit, {
          where: { publicId: dto.unit.unitId },
        });
      } else if (dto.unit?.unitIdentifier) {
        const street = await queryRunner.manager.findOne(NeighStreet, {
          where: { publicId: dto.unit.streetId },
        });

        if (!street) {
          throw new BadRequestException(
            'Target neighborhood street not found.',
          );
        }

        // Create new unit if it does not exist under that identifier
        const newUnit = queryRunner.manager.create(Unit, {
          streetId: street.id,
          identifier: dto.unit.unitIdentifier,
          neighborhoodId: neighId,
        });
        targetUnit = await queryRunner.manager.save(newUnit);
      }

      //TODO: review this
      if (targetUnit) {
        const userUnitRole = await this.catalogsService.findByPublicId(
          UserUnitRole,
          dto.unit?.unitRoleId,
        );
        if (!userUnitRole) {
          throw new BadRequestException(
            'Target unit assignment role not found.',
          );
        }

        // Deactivate previous active unit allocations if necessary
        if (dto.unit?.isCurrentOccupant) {
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
          isCurrentOccupant: dto.unit?.isCurrentOccupant,
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

  async updatePasswordOnRecoveryProcess(id: number, newPwd: string) {
    const [hashedPwd, activeStatus] = await Promise.all([
      this.cryptoService.hash(newPwd),
      this.catalogsService.findByName(UserStatus, UserStatusEnum.ACTIVE),
    ]);

    this.repository.update(id, {
      password: hashedPwd,
      statusId: activeStatus.id,
      recoveryCode: null,
      recoveryCodeExpiration: null,
      recoveryToken: null,
    });
  }

  async restorePwd(userId: number) {
    const user = await this.repository.findOne({
      where: { id: Number(userId) },
    });
    const pwd = await this.cryptoService.hash('1234');
    user.password = pwd;
    await this.repository.save(user);
  }
}
