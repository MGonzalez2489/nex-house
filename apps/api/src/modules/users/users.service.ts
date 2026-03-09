import { User } from '@database/entities';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos';
import { CryptoService } from '@common/services';
import { NeighborhoodsService } from '@modules/neighborhoods';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly neighborhoodService: NeighborhoodsService,
  ) {}

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
}
