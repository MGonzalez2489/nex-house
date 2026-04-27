import { FeeSchedule } from '@database/entities';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChargeStatusEnum, FeeScheduleStatusEnum } from '@nex-house/enums';
import { Brackets, DataSource, Repository } from 'typeorm';
import { CreateFeeScheduleDto } from '../dtos';

import { SearchDto } from '@common/dtos';
import { isToday, startOfDay, toDate } from 'date-fns';
import { FeeScheduleToModel } from '../mappers';
import { ChargeService } from './charge.service';

@Injectable()
export class FeeScheduleService {
  constructor(
    @InjectRepository(FeeSchedule)
    private readonly feeScheduleRepo: Repository<FeeSchedule>,
    private readonly dataSource: DataSource,
    private readonly chargesService: ChargeService,
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
      const newEntity: Partial<FeeSchedule> = {
        ...dto,
        startDate: new Date(),
        endDate: undefined,
      };
      newEntity.neighborhoodId = neighborhoodId;
      newEntity.createdBy = userId;

      newEntity.startDate = startOfDay(dto.startDate);
      const startFeeToday = isToday(newEntity.startDate);

      if (startFeeToday) {
        newEntity.status = FeeScheduleStatusEnum.ACTIVE;
      }

      if (dto.endDate) {
        newEntity.endDate = toDate(dto.endDate);
      }

      const cronValue = this.calculateFeeCronJob(dto);
      if (!cronValue || !cronValue.description) {
        throw new BadRequestException('Valores de recurrencia no validos');
      }

      newEntity.cronSchedule = cronValue.cron ? cronValue.cron : undefined;
      newEntity.cronDescription = cronValue.description;

      const schedule = queryRunner.manager.create(FeeSchedule, newEntity);

      const savedSchedule = await queryRunner.manager.save(schedule);

      await this.chargesService.generateChargesForResidents(
        queryRunner,
        savedSchedule,
        neighborhoodId,
      );

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

    // 1. Subconsulta para Total Recaudado (Solo con status 'applied')
    query.addSelect((subQuery) => {
      return subQuery
        .select('COALESCE(SUM(c.amount), 0)', 'total')
        .from('charges', 'c')
        .where('c.feeScheduleId = fee.id')
        .andWhere('c.status = :status', { status: ChargeStatusEnum.PAID });
    }, 'fee_totalCollected');

    // 2. Subconsulta para Conteo de Ejecuciones totales
    query.addSelect((subQuery) => {
      return subQuery
        .select('COUNT(c.id)', 'count')
        .from('charges', 'c')
        .where('c.feeScheduleId = fee.id');
    }, 'fee_executionCount');

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

    // const resssss = await query.getRawAndEntities();
    // const result = await paginateQuery(query, filters);
    // return result;

    const first = filters.first || 0;
    const rows = filters.rows || 10;

    // Ordenamiento y Paginación manual para no perder los RAW fields
    query.orderBy('fee.createdAt', 'DESC');

    if (!filters.showAll) {
      query.skip(first).take(rows);
    }

    const { entities, raw } = await query.getRawAndEntities();
    const count = await query.getCount();

    // Mapeo de resultados
    const data = entities.map((entity, index) => ({
      ...FeeScheduleToModel(entity),
      totalCollected: Number(raw[index].fee_totalCollected || 0) / 1000,
      executionCount: Number(raw[index].fee_executionCount || 0),
    }));

    return {
      data,
      meta: {
        total: count,
        page: Math.floor(first / rows) + 1,
        lastPage: Math.ceil(count / rows) || 1,
        limit: rows,
      },
    };
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

  async activateScheduledFees(): Promise<FeeSchedule[]> {
    const result = await this.feeScheduleRepo
      .createQueryBuilder()
      .update(FeeSchedule)
      .set({ status: FeeScheduleStatusEnum.ACTIVE })
      .where('status = :status', { status: FeeScheduleStatusEnum.SCHEDULED })
      .andWhere('startDate <= :today', { today: new Date() })
      .execute();

    return (result.generatedMaps as FeeSchedule[]) || [];
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

  private calculateFeeCronJob(dto: CreateFeeScheduleDto) {
    const { frecuency, dayOfMonth, dayOfWeek, startDate } = dto;
    const start = new Date(startDate);

    // Mapeo de nombres para días de la semana
    const weekDays: Record<string, string> = {
      '0': 'domingo',
      '1': 'lunes',
      '2': 'martes',
      '3': 'miércoles',
      '4': 'jueves',
      '5': 'viernes',
      '6': 'sábado',
      sunday: 'domingo',
      monday: 'lunes',
      tuesday: 'martes',
      wednesday: 'miércoles',
      thursday: 'jueves',
      friday: 'viernes',
      saturday: 'sábado',
    };

    let cron;
    let description;

    switch (frecuency) {
      case 'weekly': {
        const dw = dayOfWeek ?? start.getDay().toString();
        cron = `0 0 * * ${dw}`;
        description = `Se ejecutará cada ${weekDays[dw]} de cada semana`;
        break;
      }

      case 'monthly': {
        const dm = dayOfMonth ?? start.getDate();
        cron = `0 0 ${dm} * *`;
        description = `Se ejecutará el día ${dm} de cada mes`;
        break;
      }

      case 'yearly': {
        const day = start.getDate();
        const month = start.getMonth() + 1;
        const monthNames = [
          'enero',
          'febrero',
          'marzo',
          'abril',
          'mayo',
          'junio',
          'julio',
          'agosto',
          'septiembre',
          'octubre',
          'noviembre',
          'diciembre',
        ];
        cron = `0 0 ${day} ${month} *`;
        description = `Se ejecutará cada ${day} de ${monthNames[month - 1]} cada año`;
        break;
      }

      default:
        return { cron: null, description: 'Pago único' };
    }

    return { cron, description };
  }
}
