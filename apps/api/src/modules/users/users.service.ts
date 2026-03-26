import { SearchUserDto } from '@common/dtos';
import { CryptoService } from '@common/services';
import { paginateQuery } from '@common/utils';
import { HousingUnit, Neighborhood, User } from '@database/entities';
import { UnitAssignment } from '@database/entities/housing-assignment.entity';
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

  async findAll(neighborhoodId: string, filters: SearchUserDto) {
    const query = this.repository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.neighborhood', 'neighborhood')
      .leftJoinAndSelect('users.assignments', 'assignments')
      .leftJoinAndSelect('assignments.unit', 'unit')
      .where('neighborhood.publicId = :neighborhoodId', {
        neighborhoodId,
      });

    const { globalFilter, role, status } = filters;

    if (role) {
      query.andWhere('users.role LIKE :filter', {
        filter: `%${role}%`,
      });
    }
    if (status) {
      query.andWhere('users.status LIKE :filter', {
        filter: `%${status}%`,
      });
    }

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
            })
            .orWhere('unit.streetName LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('unit.identifier LIKE :filter', {
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
      relations: ['neighborhood', 'assignments', 'assignments.unit'],
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
      const hashedPassword = await this.cryptoService.hash('1234'); // TODO: Random pass

      const neighborhood = await queryRunner.manager.findOne(Neighborhood, {
        where: { publicId: neighborhoodId },
      });
      if (!neighborhood)
        throw new NotFoundException('Residencial no encontrado');

      // 2. Crear el Usuario
      const newUser = queryRunner.manager.create(User, {
        firstName: createDto.firstName,
        email: createDto.email.toLowerCase().trim(),
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
          isFamily: createDto.isFamily,
          isOwner: createDto.isOwner,
          isTenant: createDto.isTenant,

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

  async update(
    userPublicId: string,
    updateDto: CreateUserDto,
    currentUser: User,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Buscar el usuario existente
      const user = await queryRunner.manager.findOne(User, {
        where: { publicId: userPublicId },
        relations: ['neighborhood'], // Necesario para validar IDs numéricos
      });

      if (!user) throw new NotFoundException('Usuario no encontrado');

      // 2. Actualizar datos básicos del Usuario
      user.firstName = updateDto.firstName;
      user.lastName = updateDto.lastName; // Asumiendo que agregaste este campo
      user.phone = updateDto.phone;
      user.role = updateDto.isAdmin
        ? UserRoleEnum.ADMIN
        : UserRoleEnum.RESIDENT;

      // Si el email cambia, TypeORM lanzará error de duplicado (manejado en el catch)
      user.email = updateDto.email.toLowerCase().trim();
      user.updatedBy = currentUser.id;

      await queryRunner.manager.save(user);

      // 3. Gestión de la Unidad y Vínculos (UnitAssignment)
      // Buscamos el vínculo actual para actualizarlo o reemplazarlo
      const currentAssignment = await queryRunner.manager.findOne(
        UnitAssignment,
        {
          where: { userId: user.id, isActive: true },
        },
      );

      let targetUnitId = currentAssignment?.unitId;

      // Caso A: Se envió una unidad existente por publicId
      if (updateDto.unitId) {
        const targetUnit = await queryRunner.manager.findOne(HousingUnit, {
          where: { publicId: updateDto.unitId },
        });
        if (!targetUnit)
          throw new NotFoundException('Unidad destino no encontrada');
        targetUnitId = targetUnit.id;
      }
      // Caso B: Se solicita crear una nueva unidad
      else if (updateDto.streetName && updateDto.identifier) {
        const newUnit = queryRunner.manager.create(HousingUnit, {
          streetName: updateDto.streetName,
          identifier: updateDto.identifier,
          neighborhoodId: user.neighborhoodId,
          status: HousingStatusEnum.OCCUPIED,
        });
        const savedUnit = await queryRunner.manager.save(newUnit);
        targetUnitId = savedUnit.id;
      }

      // 4. Sincronizar el Vínculo (UnitAssignment)
      if (currentAssignment) {
        // Actualizamos el vínculo existente
        currentAssignment.unitId = targetUnitId!;
        currentAssignment.isFamily = updateDto.isFamily;
        currentAssignment.isOwner = updateDto.isOwner;
        currentAssignment.isTenant = updateDto.isTenant;
        currentAssignment.updatedBy = currentUser.id; // Auditoría
        await queryRunner.manager.save(currentAssignment);
      } else {
        // Si por alguna razón no tenía vínculo activo, creamos uno nuevo
        const newAssignment = queryRunner.manager.create(UnitAssignment, {
          unitId: targetUnitId,
          userId: user.id,
          isActive: true,
          isFamily: updateDto.isFamily,
          isOwner: updateDto.isOwner,
          isTenant: updateDto.isTenant,
          createdBy: currentUser.id,
        });
        await queryRunner.manager.save(newAssignment);
      }

      await queryRunner.commitTransaction();
      return this.findByPublicId(user.publicId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === '23505') {
        throw new ConflictException(
          'El correo electrónico ya está registrado por otro usuario.',
        );
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(publicId: string, deleter: User): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userToDelete = await queryRunner.manager.findOne(User, {
        where: { publicId },
        relations: ['assignments'],
      });

      if (!userToDelete) {
        throw new NotFoundException('Usuario no encontrado');
      }

      userToDelete.deletedBy = deleter.id;
      await queryRunner.manager.softRemove(userToDelete);

      if (userToDelete.assignments?.length > 0) {
        const activeAssignments = userToDelete.assignments.filter(
          (a) => a.isActive,
        );

        for (const assignment of activeAssignments) {
          assignment.isActive = false;
          assignment.deletedBy = deleter.id;
        }

        await queryRunner.manager.softRemove(activeAssignments);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `User ${publicId} and its assignments were deactivated by ${deleter.id}.`,
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to delete user ${publicId}`, err.stack);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async findOrThrow(publicId: string): Promise<User> {
    const user = await this.repository.findOne({ where: { publicId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${publicId} not found.`);
    }
    return user;
  }
}
