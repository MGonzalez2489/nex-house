import { CatalogsService } from '@catalogs/services';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Unit,
  UnitStatus,
  UnitType,
  User,
  UserUnit,
  UserUnitRole,
} from '@core/database';
import { DataSource } from 'typeorm';
import { CreateUnitDto } from '../dtos';
import { UnitStatusEnum } from '@nexhouse/shared-domain/enums';
import { NeighStreetService } from '@administration/neighborhood/services';

@Injectable()
export class UnitService {
  private readonly logger = new Logger(UnitService.name);
  constructor(
    private readonly catalogsService: CatalogsService,
    private readonly neighStreetService: NeighStreetService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new unit within a specific neighborhood and optionally assigns an initial user occupant/owner.
   * Executed during onboarding (first admin unit setup) or standard management (vacant/occupied unit creation).
   *
   * @param neighId - The ID of the neighborhood where the unit is being registered.
   * @param dto - Data Transfer Object containing unit specifications and optional initial assignment payload.
   * @param currentUserId - Internal ID of the authenticated user performing the creation.
   * @returns The newly created Unit entity.
   *
   * @throws {BadRequestException} If required fields are missing, the identifier format is invalid,
   *   the unit role is missing when assigning a user, or the street does not belong to the neighborhood.
   * @throws {NotFoundException} If a referenced catalog is missing or the assigned user is not found.
   * @throws {ConflictException} If a unit with the same street, type, and identifier already exists in the neighborhood.
   * @throws {InternalServerErrorException} If an unexpected database exception occurs during the transaction.
   */
  async create(
    neighId: number,
    dto: CreateUnitDto,
    currentUserId: number,
  ): Promise<Unit> {
    const { unitIdentifier, unitTypeId, streetId } = dto;

    if (!unitIdentifier || !unitTypeId || !streetId) {
      throw new BadRequestException(
        'Unit creation requires street, unit type and identifier.',
      );
    }

    if (dto.userId && !dto.unitRoleId) {
      throw new BadRequestException(
        'Unit assignment requires a unit role catalog reference.',
      );
    }

    const sanitizedIdentifier =
      this.validateAndSanitizeUnitIdentifier(unitIdentifier);

    const unitStatusEnumValue = dto.userId
      ? UnitStatusEnum.OCCUPIED
      : UnitStatusEnum.VACANT;

    const [unitType, street, unitStatus, userUnitRole] = await Promise.all([
      this.catalogsService.findByPublicId(UnitType, unitTypeId),
      this.neighStreetService.findByPublicId(streetId),
      this.catalogsService.findByName(UnitStatus, unitStatusEnumValue),
      dto.userId
        ? this.catalogsService.findByPublicId(UserUnitRole, dto.unitRoleId)
        : Promise.resolve(null),
    ]);

    if (!street) {
      throw new BadRequestException('Target neighborhood street not found.');
    }

    if (street.neighborhoodId !== neighId) {
      throw new BadRequestException(
        'Target street does not belong to this neighborhood.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUnit = await queryRunner.manager.findOne(Unit, {
        where: {
          identifier: sanitizedIdentifier,
          neighborhoodId: neighId,
          typeId: unitType.id,
          streetId: street.id,
        },
      });

      if (existingUnit) {
        throw new ConflictException(
          'Unit with this identifier already exists in the specified location.',
        );
      }

      const newUnit = queryRunner.manager.create(Unit, {
        streetId: street.id,
        identifier: sanitizedIdentifier,
        neighborhoodId: neighId,
        typeId: unitType.id,
        statusId: unitStatus.id,
        createdBy: currentUserId,
      });

      const savedUnit = await queryRunner.manager.save(newUnit);

      if (dto.userId) {
        const user = await queryRunner.manager.findOne(User, {
          where: {
            publicId: dto.userId,
            neighborhoodId: neighId,
          },
        });

        if (!user) {
          throw new NotFoundException(
            'User assigned to this unit was not found in this neighborhood.',
          );
        }

        const assignment = queryRunner.manager.create(UserUnit, {
          unitId: savedUnit.id,
          userId: user.id,
          createdBy: currentUserId,
          userUnitRole,
          isCurrentOccupant: dto.isCurrentOccupant ?? true,
        });

        await queryRunner.manager.save(assignment);
      }

      await queryRunner.commitTransaction();
      return savedUnit;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `Transaction failed during unit creation pipeline: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
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
   * Validates and normalizes the raw unit identifier string.
   * Ensures that whitespace is trimmed, letters are converted to uppercase,
   * and only valid alphanumeric characters or hyphens are present.
   *
   * @param value - Raw string input for the unit identifier.
   * @returns Sanitized string consisting strictly of A-Z, 0-9, and hyphen characters.
   *
   * @throws {BadRequestException} If value is empty or contains forbidden characters.
   */
  private validateAndSanitizeUnitIdentifier(value: string): string {
    if (!value) {
      throw new BadRequestException('Unit identifier cannot be empty.');
    }

    const sanitized = value.trim().toUpperCase();
    const validPattern = /^[A-Z0-9-]+$/;

    if (!validPattern.test(sanitized)) {
      throw new BadRequestException(
        'Invalid unit identifier. Only uppercase letters, numbers, and hyphens are allowed.',
      );
    }

    return sanitized;
  }
}
