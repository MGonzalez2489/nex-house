import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos';
import {
  NeighStreet,
  Unit,
  User,
  UserRole,
  UserStatus,
  UserUnit,
  UserUnitRole,
} from '@core/database';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import {
  formatPhone,
  generateRandomString,
  validatePhone,
} from '@nexhouse/shared-domain/utils';
import { CatalogsService } from 'src/catalogs/services';
import { UserStatusEnum } from '@nexhouse/shared-domain/enums';
import { CryptoService } from '@core/services';
import { isProd } from '@core/utils';
import { UserSearchService } from './user-search.service';

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

    let phone: string | undefined = undefined;
    if (dto.phone) {
      const formatedPhone = formatPhone(dto.phone);

      if (!validatePhone(formatedPhone)) {
        throw new BadRequestException('User phone format not valid.');
      }

      const existsPhone = await this.repository.exists({
        where: { phone: formatedPhone },
      });
      if (existsPhone) {
        throw new ConflictException(`Phone ${dto.phone} already in use.`);
      }
      phone = formatedPhone;
    }

    // 2. Resolve catalogs OUTSIDE the transaction to minimize database lock-time (Performance boost)
    const role = await this.catalogsService.findByPublicId(
      UserRole,
      dto.roleId,
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

    const pwd = isProd ? generateRandomString(10) : '1234';
    const hashedPassword = await this.cryptoService.hash(pwd);

    // 3. Begin ACID Transaction block
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create and persist the new User entity
      const nUser: DeepPartial<User> = {
        firstName: dto.firstName ? dto.firstName.trim() : '',
        lastName: dto.lastName ? dto.lastName.trim() : '',
        email: formatedEmail,
        phone,
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
      const unitDto = dto.assignUnits;

      if (unitDto.unitId) {
        targetUnit = await queryRunner.manager.findOne(Unit, {
          where: { publicId: unitDto.unitId },
        });
      } else if (unitDto.unitIdentifier) {
        const street = await queryRunner.manager.findOne(NeighStreet, {
          where: { publicId: unitDto.streetId },
        });

        if (!street) {
          throw new BadRequestException(
            `Target neighborhood street not found.`,
          );
        }

        const newUnit = queryRunner.manager.create(Unit, {
          streetId: street.id,
          identifier: unitDto.unitIdentifier,
          neighborhoodId: neighId,
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
        unitDto.userUnitRoleId,
      );
      if (!userUnitRole) {
        throw new BadRequestException('Target unit assignment role not found.');
      }

      const assignment = queryRunner.manager.create(UserUnit, {
        unitId: targetUnit.id,
        userId: savedUser.id,
        createdBy: currentUser.id,
        userUnitRole,
        isCurrentOccupant: unitDto.isOccupant,
      });

      await queryRunner.manager.save(assignment);
      await queryRunner.commitTransaction();

      // TODO: Dispatch non-blocking background notifications of success
      // TODO: Log Systemic Activity

      // Fetch the unified structural state from the read-only service representation
      return await this.searchService.findByPublicId(savedUser.publicId);
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
}
