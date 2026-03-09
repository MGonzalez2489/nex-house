import { SearchDto } from '@common/dtos';
import { PaginatedResult, paginate } from '@common/utils';
import { Neighborhood } from '@database/entities';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNeighborhoodDto } from './dtos';

@Injectable()
export class NeighborhoodsService {
  private readonly logger = new Logger(NeighborhoodsService.name);

  constructor(
    @InjectRepository(Neighborhood)
    private readonly repository: Repository<Neighborhood>,
  ) {}

  async create(dto: CreateNeighborhoodDto): Promise<Neighborhood> {
    const exists = await this.repository.findOne({
      where: { slug: dto.slug },
    });
    if (exists) {
      throw new ConflictException(
        `El fraccionamiento con slug "${dto.slug}" ya existe.`,
      );
    }
    const neighborhood = this.repository.create(dto);
    return await this.repository.save(neighborhood);
  }

  async findAll(searchDto: SearchDto): Promise<PaginatedResult<Neighborhood>> {
    return await paginate(this.repository, searchDto, {
      // Aquí podrías añadir relaciones si fuera necesario, ej: relations: ['units']
    });
  }

  async findByPublicId(publicId: string): Promise<Neighborhood | null> {
    return this.repository.findOne({ where: { publicId } });
  }

  async update(
    publicId: string,
    dto: CreateNeighborhoodDto,
  ): Promise<Neighborhood> {
    const neighborhood = await this.findByPublicId(publicId);
    if (!neighborhood) {
      throw new NotFoundException(
        `El fraccionamiento con ID ${publicId} no existe.`,
      );
    }
    const updated = this.repository.merge(neighborhood, dto);
    return await this.repository.save(updated);
  }

  async remove(publicId: string): Promise<void> {
    const neighborhood = await this.findByPublicId(publicId);
    if (!neighborhood) {
      throw new NotFoundException(
        `El fraccionamiento con ID ${publicId} no existe.`,
      );
    }
    await this.repository.softDelete(neighborhood.id);
    this.logger.log(`Neighborhood ${publicId} soft-deleted.`);
  }
}
