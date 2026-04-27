import { FeeSchedule } from '@database/entities';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeeScheduleStatusEnum } from '@nex-house/enums';
import { DataSource, LessThanOrEqual, QueryRunner } from 'typeorm';
import { ChargeService } from './charge.service';
import { FeeScheduleService } from './fee-schedule.service';

import { CronExpressionParser } from 'cron-parser';
import { endOfDay } from 'date-fns';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly feeScheduleService: FeeScheduleService,
    private readonly chargeService: ChargeService,
    private readonly dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  // @Cron('1 0 * * *', {
  //   name: 'daily-finance-automation',
  //   // timeZone: 'America/Mexico_City', // Ajusta a tu zona horaria local
  // })
  async handleDailyFinanceAutomation() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      this.logger.log('Iniciando transacción de automatización diaria...');

      // PASO 1: Activar los programados (usando el manager de la transacción)
      const activatedFees = await this.activateScheduledFees(queryRunner);
      this.logger.log(`Esquemas activados: ${activatedFees.length}`);

      // PASO 2: Procesar todos los activos (los que ya estaban + los recién activados)
      const activeFees = await queryRunner.manager.find(FeeSchedule, {
        where: { status: FeeScheduleStatusEnum.ACTIVE },
      });

      const today = new Date();
      let totalGenerated = 0;

      for (const fee of activeFees) {
        if (this.shouldExecuteToday(fee, today)) {
          await this.chargeService.generateChargesForResidents(
            queryRunner,
            fee,
            fee.neighborhoodId,
          );

          await queryRunner.manager.update(FeeSchedule, fee.id, {
            lastExecutionDate: today,
          });

          totalGenerated++;
          this.logger.log(
            `FeeSchedule ${fee.name} actualizado con fecha de ejecución: ${today}`,
          );
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `Automatización exitosa. Esquemas procesados: ${totalGenerated}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Error en automatización. Se aplicó Rollback total.',
        error.stack,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async activateScheduledFees(qr: QueryRunner): Promise<FeeSchedule[]> {
    const today = new Date();

    const toActivate = await qr.manager.find(FeeSchedule, {
      where: {
        status: FeeScheduleStatusEnum.SCHEDULED,
        startDate: LessThanOrEqual(today),
      },
    });

    if (toActivate.length === 0) return [];

    for (const fee of toActivate) {
      fee.status = FeeScheduleStatusEnum.ACTIVE;
    }

    return await qr.manager.save(toActivate);
  }

  private shouldExecuteToday(fee: FeeSchedule, today: Date): boolean {
    if (!fee.cronSchedule) return false;

    try {
      const baseDate = new Date(fee.lastExecutionDate || fee.startDate);
      baseDate.setSeconds(baseDate.getSeconds() - 1);

      const options = {
        currentDate: baseDate,
        endDate: endOfDay(today),
        iterator: true,
      };

      const interval = CronExpressionParser.parse(fee.cronSchedule, options);

      return interval.hasNext();
    } catch (err) {
      console.log('err:', err);

      return false;
    }
  }
}
