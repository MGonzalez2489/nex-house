import { SearchDto } from '@common/dtos';
import { CryptoService } from '@common/services';
import { paginate } from '@common/utils';
import { User } from '@database/entities';
import { NeighborhoodsService } from '@modules/neighborhoods';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly neighborhoodService: NeighborhoodsService,
  ) {}

  async findAll(searchDto: SearchDto) {
    return await paginate(this.repository, searchDto);
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

    const hashedPassword = await this.cryptoService.hash(dto.password);

    const newUser = this.repository.create({
      ...dto,
      password: hashedPassword,
      neighborhoodId: neighborhood?.id,
      createdBy: user.id,
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
    if (dto.password) {
      dto.password = await this.cryptoService.hash(dto.password);
    }

    const updated = this.repository.merge(userToUpdate, {
      ...dto,
      updatedBy: updater.id,
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
