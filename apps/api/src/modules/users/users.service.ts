import { SearchDto } from '@common/dtos';
import { CryptoService } from '@common/services';
import { paginateQuery } from '@common/utils';
import { HousingUnit, Neighborhood, User } from '@database/entities';
import { NeighborhoodsService } from '@modules/neighborhoods';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  HousingStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@nex-house/enums';
import { Brackets, DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dtos';
import { UnitAssignment } from '@database/entities/housing-assignment.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly neighborhoodService: NeighborhoodsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(neighborhoodId: string, filters: SearchDto) {
    const query = this.repository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.neighborhood', 'neighborhood')
      .leftJoinAndSelect('users.assignments', 'assignments')
      .leftJoinAndSelect('assignments.unit', 'unit')
      .where('neighborhood.publicId = :neighborhoodId', {
        neighborhoodId,
      });

    const { globalFilter } = filters;

    if (globalFilter) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('users.firstName LIKE :filter', {
            filter: `%${globalFilter}%`,
          })
            .orWhere('users.lastName LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('users.email LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('users.phone LIKE :filter', {
              filter: `%${globalFilter}%`,
            });
        }),
      );
    }

    const result = await paginateQuery(query, filters);
    return result;
  }

  async findByPublicId(publicId: string): Promise<User | null> {
    const result = await this.repository.findOne({
      where: { publicId },
      relations: ['neighborhood', 'assignments', 'assignments.unit'],
    });
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.repository.findOne({
      where: { email },
    });
    return result;
  }

  async create(
    neighborhoodId: string,
    createDto: CreateUserDto,
    currentUser: User,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Preparación de Seguridad
      const hashedPassword = await this.cryptoService.hash('1234'); // TODO: Random pass

      const neighborhood = await queryRunner.manager.findOne(Neighborhood, {
        where: { publicId: neighborhoodId },
      });
      if (!neighborhood)
        throw new NotFoundException('Residencial no encontrado');

      // 2. Crear el Usuario
      const newUser = queryRunner.manager.create(User, {
        firstName: createDto.firstName,
        email: createDto.email,
        role: createDto.isAdmin ? UserRoleEnum.ADMIN : UserRoleEnum.RESIDENT,
        status: UserStatusEnum.PENDING_COMPLETION,
        createdBy: currentUser.id,
        neighborhoodId: neighborhood.id, // Usamos ID numérico por performance
        password: hashedPassword,
      });
      const savedUser = await queryRunner.manager.save(newUser);

      let targetUnit: HousingUnit | null = null;

      // 3. Gestión de la Unidad (Existente o Nueva)
      if (createDto.unitId) {
        targetUnit = await queryRunner.manager.findOne(HousingUnit, {
          where: { publicId: createDto.unitId },
        });
      } else if (createDto.streetName && createDto.identifier) {
        const newUnit = queryRunner.manager.create(HousingUnit, {
          streetName: createDto.streetName,
          identifier: createDto.identifier,
          neighborhoodId: neighborhood.id,
          ownerId: savedUser.id, // El creador de la unidad es el dueño inicial
          status: HousingStatusEnum.OCCUPIED,
        });
        targetUnit = await queryRunner.manager.save(newUnit);
      }

      if (!targetUnit) {
        throw new NotFoundException('Unidad no encontrada');
      }

      // 4. CREAR VÍNCULO MULTI-USUARIO (La nueva relación)
      if (targetUnit) {
        const assignment = queryRunner.manager.create(UnitAssignment, {
          unitId: targetUnit.id,
          userId: savedUser.id,
          isActive: true,
          createdBy: currentUser.id,
          // Aquí podrías usar un enum para distinguir roles internos
        });
        await queryRunner.manager.save(assignment);
      }

      await queryRunner.commitTransaction();
      return this.findByPublicId(savedUser.publicId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // Manejo manual de errores comunes (ej. Email duplicado)
      if (err.code === '23505') {
        throw new ConflictException(
          'El correo electrónico ya está registrado.',
        );
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  //
  async update(
    publicId: string,
    dto: CreateUserDto,
    updater: User,
  ): Promise<User> {
    const userToUpdate = await this.findOrThrow(publicId);

    // Si el DTO incluye password, lo hasheamos antes de hacer el merge
    // if (dto.password) {
    const hashedPassword = await this.cryptoService.hash('1234');
    // }

    const updated = this.repository.merge(userToUpdate, {
      ...dto,
      updatedBy: updater.id,
      password: hashedPassword,
    });

    await this.repository.save(updated);
    return this.findOrThrow(publicId);
  }

  async remove(publicId: string, deleter: User): Promise<void> {
    const userToDelete = await this.findOrThrow(publicId);

    userToDelete.deletedBy = deleter.id;

    await this.repository.softRemove(userToDelete);
    this.logger.log(`User ${publicId} soft-deleted by admin ${deleter.id}.`);
  }

  //
  private async findOrThrow(publicId: string): Promise<User> {
    const user = await this.repository.findOne({ where: { publicId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${publicId} not found.`);
    }
    return user;
  }
}
