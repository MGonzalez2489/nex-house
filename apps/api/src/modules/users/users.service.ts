import { SearchUserDto } from '@common/dtos';
import { CryptoService } from '@common/services';
import {
  formatPhone,
  generateRandomString,
  isProd,
  isValidEmail,
  paginateQuery,
  validatePhone,
} from '@common/utils';
import { HousingUnit, Neighborhood, User } from '@database/entities';
import { UnitAssignment } from '@database/entities/housing-assignment.entity';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import {
  Brackets,
  DataSource,
  DeepPartial,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CreateUserDto } from './dtos';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(neighborhoodId: number, filters: SearchUserDto) {
    const query = this.repository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.neighborhood', 'neighborhood')
      .leftJoinAndSelect('users.assignments', 'assignments')
      .leftJoinAndSelect('assignments.unit', 'unit')
      .where('neighborhood.id = :neighborhoodId', {
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
      const globalFilterWords = globalFilter
        .split(' ')
        .filter((word) => word.length > 0);

      if (globalFilterWords.length > 0) {
        query.andWhere(
          new Brackets((andQb) => {
            globalFilterWords.forEach((word, index) => {
              const paramName = `globalFilterWord${index}`;
              andQb.andWhere(
                new Brackets((orQb) => {
                  orQb
                    .where(`users.firstName LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`users.lastName LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`users.email LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`users.phone LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`unit.streetName LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`unit.identifier LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    });
                }),
              );
            });
          }),
        );
      }
    }

    query.addSelect(
      `CASE users.role WHEN '${UserRoleEnum.ADMIN}' THEN 1 WHEN '${UserRoleEnum.RESIDENT}' THEN 2 ELSE 3 END`,
      'roleOrder',
    );
    query.addOrderBy('roleOrder', 'ASC');
    query.addOrderBy('users.firstName', 'ASC');
    query.addOrderBy('users.lastName', 'ASC');

    const result = await paginateQuery(query, filters);
    return result;
  }

  async findByPublicId(
    publicId: string,
    neighborhoodId?: number,
  ): Promise<User | null> {
    const whereCondition: FindOptionsWhere<User> = { publicId };
    if (neighborhoodId !== undefined) {
      whereCondition.neighborhood = { id: neighborhoodId };
    }

    const result = await this.repository.findOne({
      where: whereCondition,
      relations: ['neighborhood', 'assignments', 'assignments.unit'],
    });
    return result;
  }

  async findByEmail(
    email: string,
    neighborhoodId?: number,
  ): Promise<User | null> {
    const whereCondition: FindOptionsWhere<User> = { email };
    if (neighborhoodId !== undefined) {
      whereCondition.neighborhood = { id: neighborhoodId };
    }
    const result = await this.repository.findOne({
      where: whereCondition,
      relations: ['neighborhood', 'assignments', 'assignments.unit'],
    });
    return result;
  }

  async findByResetPasswordCode(code: number) {
    return this.repository.findOne({
      where: { pwdResetCode: code },
      relations: ['neighborhood', 'assignments', 'assignments.unit'],
    });
  }

  async create(
    neighborhood: Neighborhood,
    createDto: CreateUserDto,
    currentUser: User,
  ) {
    const { email, phone } = createDto;

    //email validations
    const formatedEmail = await this.validateEmail(email);
    //phone validations
    const formatedPhone = phone
      ? await this.validateAndFormatPhone(phone)
      : undefined;

    //unit validations
    if (!createDto.unitId) {
      if (!createDto.streetName) {
        throw new BadRequestException('Street name is required.');
      }
      if (!createDto.identifier) {
        throw new BadRequestException('Identifier is required.');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pwd = isProd ? generateRandomString(10) : '1234';
      const hashedPassword = await this.cryptoService.hash(pwd);

      const nUser: DeepPartial<User> = {
        firstName: createDto.firstName.trim(),
        lastName: createDto.lastName
          ? createDto.lastName.trim()
          : createDto.lastName,
        email: formatedEmail,
        phone: formatedPhone,
        role: createDto.isAdmin ? UserRoleEnum.ADMIN : UserRoleEnum.RESIDENT,
        status: UserStatusEnum.PENDING_COMPLETION,
        createdBy: currentUser.id,
        neighborhoodId: neighborhood.id,
        password: hashedPassword,
      };

      // 2. Create User
      const newUser = queryRunner.manager.create(User, nUser);

      const savedUser = await queryRunner.manager.save(newUser);

      let targetUnit: HousingUnit | null = null;

      // 3. Handle unit (new or existing)
      if (createDto.unitId) {
        targetUnit = await queryRunner.manager.findOne(HousingUnit, {
          where: { publicId: createDto.unitId },
        });
      } else if (createDto.streetName && createDto.identifier) {
        const newUnit = queryRunner.manager.create(HousingUnit, {
          streetName: createDto.streetName,
          identifier: createDto.identifier,
          neighborhoodId: neighborhood.id,
          ownerId: savedUser.id,
          status: HousingStatusEnum.OCCUPIED,
        });
        targetUnit = await queryRunner.manager.save(newUnit);
      }

      if (!targetUnit) {
        throw new NotFoundException('Unit not found.');
      }

      // 4. Unit assignment
      if (targetUnit) {
        const assignment = queryRunner.manager.create(UnitAssignment, {
          unitId: targetUnit.id,
          userId: savedUser.id,
          isActive: true,
          createdBy: currentUser.id,
          isFamily: createDto.isFamily,
          isOwner: createDto.isOwner,
          isTenant: createDto.isTenant,
        });
        await queryRunner.manager.save(assignment);
      }

      //TODO: Send email notification

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
      // 1. Find user
      const user = await queryRunner.manager.findOne(User, {
        where: { publicId: userPublicId },
        relations: ['neighborhood'], // Necesario para validar IDs numéricos
      });

      if (!user) throw new NotFoundException('Usuario no encontrado');

      // 2. Actualizar datos básicos del Usuario
      if (updateDto.firstName && user.firstName !== updateDto.firstName) {
        user.firstName = updateDto.firstName.trim();
      }
      if (updateDto.lastName && user.lastName !== updateDto.lastName) {
        user.lastName = updateDto.lastName.trim();
      }
      if (user.phone) {
        const fPhone = await this.validateAndFormatPhone(user.phone);
        if (user.phone !== fPhone) {
          user.phone = fPhone;
        }
      }
      if (user.email) {
        const fEmail = await this.validateEmail(user.email);
        if (user.phone !== fEmail) {
          user.email = fEmail;
        }
      }
      user.role = updateDto.isAdmin
        ? UserRoleEnum.ADMIN
        : UserRoleEnum.RESIDENT;

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
          updatedBy: currentUser.id,
        });
        await queryRunner.manager.save(newAssignment);
      }

      await queryRunner.commitTransaction();
      //TODO: Send email notification
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

  async update_internal(id: number, data: Partial<User>): Promise<User> {
    const user = await this.repository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${id} not found for internal update`,
      );
    }

    const updatedUser = this.repository.merge(user, data);

    this.logger.log(`Internal update executed for user: ${user.email}`);
    await this.repository.save(updatedUser);
    const savedUser = await this.findByPublicId(user.publicId);
    return savedUser!;
  }

  async remove(
    publicId: string,
    deleter: User,
    neighborhood: Neighborhood,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userToDelete = await queryRunner.manager.findOne(User, {
        where: {
          publicId,
          neighborhood: {
            id: neighborhood.id,
          },
        },
        relations: ['assignments', 'neighborhood'],
      });

      if (!userToDelete) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (userToDelete.neighborhoodId !== deleter.neighborhoodId) {
        throw new ForbiddenException('Accion no permitida por scope.');
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

  ///////////////////////////////////
  /////////////////// PRIVATE METHODS ///////////////////
  ///////////////////////////////////
  async validateEmail(email: string) {
    //email validations
    if (!email) {
      throw new BadRequestException('User email is required.');
    }
    if (!isValidEmail(email)) {
      throw new BadRequestException('User email format not valid.');
    }
    const formatedEmail = email.toLowerCase().trim();
    const existsEmail = await this.repository.exists({
      where: { email: formatedEmail },
    });
    if (existsEmail) {
      throw new ConflictException(`Email ${existsEmail} already in use.`);
    }
    return formatedEmail;
  }

  async validateAndFormatPhone(phone: string) {
    const formatedPhone = formatPhone(phone);

    if (!validatePhone(formatedPhone)) {
      throw new BadRequestException('User phone format not valid.');
    }

    const existsPhone = await this.repository.exists({
      where: { phone: formatedPhone },
    });

    if (existsPhone) {
      throw new ConflictException(`Phone ${phone} already in use.`);
    }

    return formatedPhone;
  }
}
