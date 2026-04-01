import { FeeSchedule } from '@database/entities';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeeScheduleStatusEnum } from '@nex-house/enums';
import { Brackets, DataSource, Repository } from 'typeorm';
import { CreateFeeScheduleDto } from '../dtos';

import { SearchDto } from '@common/dtos';
import { paginateQuery } from '@common/utils';
import { startOfDay } from 'date-fns';

@Injectable()
export class FeeScheduleService {
  constructor(
    @InjectRepository(FeeSchedule)
    private readonly feeScheduleRepo: Repository<FeeSchedule>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateFeeScheduleDto,
    neighborhoodId: number,
    userId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newEntity: Partial<FeeSchedule> = { ...dto };
      newEntity.neighborhoodId = neighborhoodId;
      newEntity.createdBy = userId;

      newEntity.startDate = startOfDay(dto.startDate).toISOString();
      const schedule = queryRunner.manager.create(FeeSchedule, newEntity);

      const savedSchedule = await queryRunner.manager.save(schedule);

      // LÓGICA OPCIONAL: Si es ONE_TIME e inmediata, podrías disparar
      // la creación de Charges aquí mismo dentro de la transacción.

      await queryRunner.commitTransaction();
      return savedSchedule;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error al crear el esquema de cobro' + err,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(neighborhoodId: number, filters: SearchDto) {
    const query = this.feeScheduleRepo
      .createQueryBuilder('fee')
      .leftJoinAndSelect('fee.neighborhood', 'neighborhood')
      .where('neighborhood.id = :neighborhoodId', {
        neighborhoodId,
      });

    const { globalFilter } = filters;

    if (globalFilter) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('fee.name LIKE :filter', {
            filter: `%${globalFilter}%`,
          }).orWhere('fee.description LIKE :filter', {
            filter: `%${globalFilter}%`,
          });
        }),
      );
    }

    const result = await paginateQuery(query, filters);
    return result;
  }

  async findOne(publicId: string) {
    const schedule = await this.feeScheduleRepo.findOneBy({ publicId });
    if (!schedule) throw new BadRequestException('Esquema no encontrado');
    return schedule;
  }

  async update(id: number, dto: any, userId: number) {
    // Implementar lógica similar con transacción si el cambio de monto
    // afecta cargos pendientes.
    return this.feeScheduleRepo.update(id, { ...dto, updatedBy: userId });
  }

  async remove(id: number, userId: number) {
    const feeScheduleRecord = await this.feeScheduleRepo.findOne({
      where: { id },
    });
    if (!feeScheduleRecord) {
      throw new NotFoundException('Record not found');
    }

    feeScheduleRecord.deletedBy = userId;
    feeScheduleRecord.status = FeeScheduleStatusEnum.CANCELLED;

    this.feeScheduleRepo.softRemove(feeScheduleRecord);
  }
}
