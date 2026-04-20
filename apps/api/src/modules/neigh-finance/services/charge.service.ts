import { SearchChargeDto } from '@common/dtos';
import { paginateQuery } from '@common/utils';
import {
  Charge,
  FeeSchedule,
  Payment,
  PaymentApplication,
  Transaction,
  User,
} from '@database/entities';
import { HousingUnitsService } from '@modules/housing-units/housing-units.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChargeStatusEnum,
  DateOptionsFilterEnum,
  PaymentStatusEnum,
  TransactionSourceTypeEnum,
  TransactionTypeEnum,
} from '@nex-house/enums';
import { ChargeSummaryModel } from '@nex-house/models';
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subMonths,
  toDate,
} from 'date-fns';
import {
  Brackets,
  DataSource,
  DeepPartial,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChargeConfirmDto } from '../dtos';

@Injectable()
export class ChargeService {
  constructor(
    @InjectRepository(Charge)
    private readonly repo: Repository<Charge>,
    private readonly unitService: HousingUnitsService,
    private readonly dataSource: DataSource,
  ) {}

  async generateChargesForResidents(
    qr: QueryRunner,
    schedule: FeeSchedule,
    neighborhoodId: number,
  ) {
    const unitsResponse = await this.unitService.findAll(neighborhoodId, {
      showAll: true,
      first: 0,
      rows: 0,
      sortField: '',
      sortOrder: 0,
    });

    const units = unitsResponse.data;

    const charges = units
      .filter((f) => f.assignments && f.assignments.length > 0)
      .map((unit) => {
        let issuedUser = unit.assignments.find((f) => f.isOwner)?.user;
        if (!issuedUser) {
          issuedUser = unit.assignments.find((f) => f.isTenant)?.user;
        }
        if (!issuedUser) {
          issuedUser = unit.assignments[0].user;
        }
        const nEntity: DeepPartial<Charge> = {
          unitId: unit.id,
          amount: schedule.amount,
          description: schedule.name,
          issuedToUserId: issuedUser.id,
          feeScheduleId: schedule.id,
          status: ChargeStatusEnum.PENDING,
          dueDate: startOfDay(schedule.startDate).toUTCString(), //TODO: change it to add grace days later
        };

        return qr.manager.create(Charge, nEntity);
      });

    // Inserción masiva para performance
    await qr.manager.insert(Charge, charges);
  }
  async findByPublicId(publicId: string, neighborhoodId: number) {
    return this.repo.findOne({
      where: {
        publicId,
        unit: {
          neighborhoodId,
        },
      },
      relations: ['unit', 'issuedToUser', 'feeSchedule'],
    });
  }
  async findAll(neighborhoodId: number, filters: SearchChargeDto) {
    const query = this.repo
      .createQueryBuilder('charge')
      .leftJoinAndSelect('charge.unit', 'unit')
      .leftJoinAndSelect('charge.issuedToUser', 'user')
      .leftJoinAndSelect('charge.feeSchedule', 'fee')
      .where('unit.neighborhoodId = :neighborhoodId', {
        neighborhoodId,
      });

    const { globalFilter, status, filterDate, from, to } = filters;

    if (status) {
      query.andWhere('charge.status LIKE :filter', {
        filter: `%${status}%`,
      });
    }

    let queryFromDate: Date | undefined;
    let queryToDate: Date | undefined;

    if (filterDate === DateOptionsFilterEnum.THIS_MONTH) {
      queryFromDate = startOfMonth(new Date());
      queryToDate = endOfMonth(new Date());
    } else if (filterDate === DateOptionsFilterEnum.LAST_MONTH) {
      const today = new Date();
      const lastMonthDate = subMonths(today, 1);
      queryFromDate = startOfMonth(lastMonthDate);
      queryToDate = endOfMonth(lastMonthDate);
    } else {
      //custom
      if (from) {
        queryFromDate = startOfDay(from);
      }
      if (to) {
        queryToDate = endOfDay(to);
      }
    }

    if (queryFromDate) {
      query.andWhere('charge.dueDate >= :queryFromDate', {
        queryFromDate: queryFromDate.toISOString(),
      });
    }
    if (queryToDate) {
      query.andWhere('charge.dueDate <= :queryToDate', {
        queryToDate: queryToDate.toISOString(),
      });
    }

    if (globalFilter) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.firstName LIKE :filter', {
            filter: `%${globalFilter}%`,
          })
            .orWhere('user.lastName LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('user.email LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('user.phone LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('unit.streetName LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('unit.identifier LIKE :filter', {
              filter: `%${globalFilter}%`,
            });
        }),
      );
    }

    query.addOrderBy('user.firstName', 'ASC');
    query.addOrderBy('user.lastName', 'ASC');

    const result = await paginateQuery(query, filters);
    return result;
  }
  async getSummary(
    neighborhoodId: number,
    filters: SearchChargeDto,
  ): Promise<ChargeSummaryModel> {
    const query = this.repo
      .createQueryBuilder('charge')
      .leftJoin('charge.unit', 'unit')
      .leftJoin('charge.issuedToUser', 'user')
      .select([
        // --- MONTOS (SUM) ---
        `SUM(CASE WHEN charge.status = '${ChargeStatusEnum.PENDING}' THEN charge.amount ELSE 0 END) as pendingAmount`,
        `SUM(CASE WHEN charge.status = '${ChargeStatusEnum.PAID}' THEN charge.amount ELSE 0 END) as paidAmount`,
        `SUM(CASE WHEN charge.status = '${ChargeStatusEnum.CANCELLED}' THEN charge.amount ELSE 0 END) as cancelledAmount`,

        // --- CONTEOS (COUNT) ---
        `COUNT(CASE WHEN charge.status = '${ChargeStatusEnum.PENDING}' THEN 1 END) as pendingCount`,
        `COUNT(CASE WHEN charge.status = '${ChargeStatusEnum.PAID}' THEN 1 END) as paidCount`,
        `COUNT(CASE WHEN charge.status = '${ChargeStatusEnum.CANCELLED}' THEN 1 END) as cancelledCount`,

        // --- VENCIDOS (COUNT) ---
        `COUNT(CASE WHEN charge.status = '${ChargeStatusEnum.PENDING}' AND charge.dueDate < CURRENT_TIMESTAMP THEN 1 END) as overdueCount`,
      ])
      .where('unit.neighborhoodId = :neighborhoodId', { neighborhoodId });

    // Reutilizamos tu lógica de filtrado global
    if (filters.globalFilter) {
      query.andWhere(
        new Brackets((qb) => {
          const filter = `%${filters.globalFilter}%`;
          qb.where('user.firstName LIKE :filter', { filter })
            .orWhere('user.lastName LIKE :filter', { filter })
            .orWhere('user.email LIKE :filter', { filter })
            .orWhere('unit.streetName LIKE :filter', { filter })
            .orWhere('unit.identifier LIKE :filter', { filter });
        }),
      );
    }

    const raw = await query.getRawOne();

    // Parseo de seguridad para asegurar que regresamos números
    const paid = parseFloat(raw.paidAmount || '0');
    const pending = parseFloat(raw.pendingAmount || '0');
    const total = paid + pending;

    return {
      totalPendingAmount: pending / 1000,
      pendingCount: parseInt(raw.pendingCount || '0'),

      totalPaidAmount: paid / 1000,
      paidCount: parseInt(raw.paidCount || '0'),

      totalCancelledAmount: parseFloat(raw.cancelledAmount || '0') / 1000,
      cancelledCount: parseInt(raw.cancelledCount || '0'),

      overdueCount: parseInt(raw.overdueCount || '0'),
      collectionRate: total > 0 ? (paid / total) * 100 : 0,
    };
  }

  async cancelPayment(
    chargeId: string,
    neighborhoodId: number,
    reason: string,
    user: User,
  ) {
    const charge = await this.findByPublicId(chargeId, neighborhoodId);

    if (!charge) throw new NotFoundException('Cargo no encontrado');

    if (charge.status !== ChargeStatusEnum.PENDING) {
      throw new BadRequestException(
        'Solo se pueden cancelar cargos pendientes',
      );
    }

    charge.status = ChargeStatusEnum.CANCELLED;
    charge.canceledByUserId = user.id;
    charge.cancelationReason = reason;

    await this.repo.save(charge);
    return await this.findByPublicId(chargeId, neighborhoodId);
  }

  async confirmPayment(
    chargeId: string,
    neighborhoodId: number,
    confirmedByUser: User,
    dto: ChargeConfirmDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Obtener el cargo con su relación de unidad (para saber a qué fraccionamiento pertenece)
      const charge = await queryRunner.manager.findOne(Charge, {
        where: { publicId: chargeId, unit: { neighborhoodId } },
        relations: ['unit'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!charge) throw new NotFoundException('Cargo no encontrado');
      if (charge.status === ChargeStatusEnum.PAID)
        throw new BadRequestException('El cargo ya está pagado');

      // 2. Actualizar el status del cargo
      charge.status = ChargeStatusEnum.PAID;
      await queryRunner.manager.save(charge);

      const payment = queryRunner.manager.create(Payment, {
        unit: charge.unit,
        amount: charge.amount,
        status: PaymentStatusEnum.APPROVED,
        createdBy: confirmedByUser.id, //TODO: fix this
        paymentDate: new Date(),
        reportedByUserId: confirmedByUser.id, //TODO: fix this// this will be the user when uploads the payment screenshot
        adminNotes: dto.approvalNotes,
        evidenceUrl: dto.evidenceUrl,
      });
      const savedPayment = await queryRunner.manager.save(payment);

      // 3. Crear la Transacción Contable (El "Ingreso")
      // Aquí es donde el fraccionamiento recibe el saldo a favor
      const transaction = queryRunner.manager.create(Transaction, {
        neighborhoodId,
        amount: charge.amount,
        type: TransactionTypeEnum.INCOME, // Ingreso
        description: `Pago recibido: ${charge.description} - Unidad ${charge.unit.streetName} - ${charge.unit.identifier}`,
        transactionDate: new Date(),
        source: TransactionSourceTypeEnum.PAYMENT,
        createdBy: confirmedByUser.id,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      // 4. Crear la Aplicación de Pago (El vínculo)
      const paymentApp = queryRunner.manager.create(PaymentApplication, {
        chargeId: charge.id,
        transactionId: savedTransaction.id,
        amountApplied: charge.amount,
        paymentId: savedPayment.id,
        appliedAt: toDate(dto.paymentDate),
      });
      await queryRunner.manager.save(paymentApp);

      // Si todo salió bien, confirmamos
      await queryRunner.commitTransaction();

      const response = await this.findByPublicId(chargeId, neighborhoodId);
      if (!response) {
        throw new InternalServerErrorException('Charge not found!');
      }
      return response;
    } catch (error) {
      // Si algo falla (ej. la base de datos se cae a mitad de camino), revertimos TODO
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
