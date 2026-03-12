import { SearchDto } from '@common/dtos';
import { CryptoService } from '@common/services';
import { paginateQuery } from '@common/utils';
import { User } from '@database/entities';
import { NeighborhoodsService } from '@modules/neighborhoods';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CreateUserDto } from './dtos';
import { UserRoleEnum } from '@nex-house/enums';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly neighborhoodService: NeighborhoodsService,
  ) {}

  async findAll(neighborhoodId: string, filters: SearchDto) {
    const query = this.repository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.neighborhood', 'neighborhood')
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
    });
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.repository.findOne({
      where: { email },
    });
    return result;
  }

  async create(neighborhoodId: string, dto: CreateUserDto, user: User) {
    const neighborhood = await this.neighborhoodService.findByPublicId(
      neighborhoodId,
      true,
    );

    const exists = await this.repository.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException(
        `User with email ${dto.email} already exists.`,
      );
    }

    const role = dto.isAdmin ? UserRoleEnum.ADMIN : UserRoleEnum.RESIDENT;

    const hashedPassword = await this.cryptoService.hash('1234');

    const newUser = this.repository.create({
      ...dto,
      password: hashedPassword,
      neighborhoodId: neighborhood?.id,
      createdBy: user.id,
      role,
    });

    await this.repository.save(newUser);

    return this.findByPublicId(newUser.publicId);
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
