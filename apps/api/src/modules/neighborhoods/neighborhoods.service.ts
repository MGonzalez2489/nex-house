import { SearchDto } from '@common/dtos';
import { PaginatedResult, paginateQuery } from '@common/utils';
import { Neighborhood, User } from '@database/entities';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CreateNeighborhoodDto } from './dtos';

@Injectable()
export class NeighborhoodsService {
  private readonly logger = new Logger(NeighborhoodsService.name);

  constructor(
    @InjectRepository(Neighborhood)
    private readonly repository: Repository<Neighborhood>,
  ) {}

  async create(dto: CreateNeighborhoodDto, user: User): Promise<Neighborhood> {
    const exists = await this.repository.findOne({
      where: { slug: dto.slug },
    });
    if (exists) {
      throw new ConflictException(
        `El fraccionamiento con slug "${dto.slug}" ya existe.`,
      );
    }
    const neighborhood = this.repository.create({ ...dto, createdBy: user.id });
    return await this.repository.save(neighborhood);
  }

  async findAll(search: SearchDto): Promise<PaginatedResult<Neighborhood>> {
    const { globalFilter } = search;

    const query = this.repository.createQueryBuilder('neighborhood');

    if (globalFilter) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('neighborhood.name LIKE :filter', {
            filter: `%${globalFilter}%`,
          })
            .orWhere('neighborhood.slug LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('neighborhood.address LIKE :filter', {
              filter: `%${globalFilter}%`,
            });
        }),
      );
    }

    const result = await paginateQuery(query, search);
    return result;
  }

  async findByPublicId(
    publicId: string,
    validateExists = false,
  ): Promise<Neighborhood | null> {
    const response = await this.repository.findOne({ where: { publicId } });

    if (!response && validateExists) {
      throw new NotFoundException(`Neighborhood ${publicId} not found.`);
    }
    return response;
  }

  async update(
    publicId: string,
    dto: CreateNeighborhoodDto,
    user: User,
  ): Promise<Neighborhood> {
    const neighborhood = await this.findByPublicId(publicId);
    if (!neighborhood) {
      throw new NotFoundException(
        `El fraccionamiento con ID ${publicId} no existe.`,
      );
    }
    const updated = this.repository.merge(
      { ...neighborhood, updatedBy: user.id },
      dto,
    );
    return await this.repository.save(updated);
  }

  async remove(publicId: string, user: User): Promise<void> {
    const neighborhood = await this.findByPublicId(publicId);
    if (!neighborhood) {
      throw new NotFoundException(
        `El fraccionamiento con ID ${publicId} no existe.`,
      );
    }
    neighborhood.deletedBy = user.id;
    await this.repository.softRemove(neighborhood);
    this.logger.log(`Neighborhood ${publicId} soft-deleted.`);
  }
}
