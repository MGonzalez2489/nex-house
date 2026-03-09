import { SearchDto } from '@common/dtos';
import { PaginatedResult, paginate } from '@common/utils';
import { HousingUnit, User } from '@database/entities';
import { NeighborhoodsService } from '@modules/neighborhoods';
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
    private readonly neighborhoodService: NeighborhoodsService,
  ) {}

  async bulkCreate(
    neighborhoodId: string,
    dto: BulkCreateHousingUnitDto,
    user: User,
  ): Promise<HousingUnit[]> {
    const units: Partial<HousingUnit>[] = [];

    const neighborhood = await this.neighborhoodService.findByPublicId(
      neighborhoodId,
      true,
    );

    for (let i = dto.startNumber; i <= dto.endNumber; i++) {
      units.push({
        neighborhoodId: neighborhood?.id,
        identifier: i.toString(),
        streetName: dto.streetName,
        createdBy: user.id,
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
      where: {},
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
    user: User,
  ): Promise<HousingUnit> {
    const neighborhood = await this.neighborhoodService.findByPublicId(
      neighborhoodId,
      true,
    );
    const unit = this.repository.create({
      ...dto,
      neighborhoodId: neighborhood?.id,
      createdBy: user.id,
    });
    return await this.repository.save(unit);
  }

  async update(
    publicId: string,
    dto: Partial<BulkCreateHousingUnitDto>,
    user: User,
  ): Promise<HousingUnit> {
    const unit = await this.findByPublicId(publicId);
    const updated = this.repository.merge({ ...unit, updatedBy: user.id }, dto);
    return await this.repository.save(updated);
  }

  async remove(publicId: string, user: User): Promise<void> {
    const unit = await this.findByPublicId(publicId);
    unit.deletedBy = user.id;
    await this.repository.softRemove(unit);
  }
}
