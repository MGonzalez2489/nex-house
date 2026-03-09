import { SearchDto } from '@common/dtos';
import { PaginatedResult, paginate } from '@common/utils';
import { HousingUnit } from '@database/entities';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHousingUnitDto } from './dtos';
import { BulkCreateHousingUnitDto } from './dtos/bulk-create-unit.dto';

@Injectable()
export class HousingUnitsService {
  private readonly logger = new Logger(HousingUnitsService.name);

  constructor(
    @InjectRepository(HousingUnit)
    private readonly repository: Repository<HousingUnit>,
  ) {}

  async bulkCreate(
    neighborhoodId: string,
    dto: BulkCreateHousingUnitDto,
  ): Promise<HousingUnit[]> {
    const units: Partial<HousingUnit>[] = [];

    for (let i = dto.startNumber; i <= dto.endNumber; i++) {
      units.push({
        neighborhoodId,
        identifier: i.toString(),
        streetName: dto.streetName,
      });
    }

    // TODO: include full identifier in the model

    return await this.repository.save(this.repository.create(units));
  }

  async findAll(
    neighborhoodId: string,
    searchDto: SearchDto,
  ): Promise<PaginatedResult<HousingUnit>> {
    return await paginate(this.repository, searchDto, {
      where: { neighborhoodId },
    });
  }

  async findByPublicId(publicId: string): Promise<HousingUnit> {
    const unit = await this.repository.findOne({ where: { publicId } });
    if (!unit) {
      throw new NotFoundException(
        `Housing unit with ID ${publicId} not found.`,
      );
    }
    return unit;
  }

  async create(
    neighborhoodId: string,
    dto: CreateHousingUnitDto,
  ): Promise<HousingUnit> {
    const unit = this.repository.create({ ...dto, neighborhoodId });
    return await this.repository.save(unit);
  }

  async update(
    publicId: string,
    dto: Partial<BulkCreateHousingUnitDto>,
  ): Promise<HousingUnit> {
    const unit = await this.findByPublicId(publicId);
    const updated = this.repository.merge(unit, dto);
    return await this.repository.save(updated);
  }

  async remove(publicId: string): Promise<void> {
    const unit = await this.findByPublicId(publicId);
    await this.repository.softDelete(unit.id);
  }
}
