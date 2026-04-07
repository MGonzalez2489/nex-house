import {
  Charge,
  Expense,
  FeeSchedule,
  Payment,
  PaymentApplication,
  Transaction,
} from '@database/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ChargesController,
  FeeScheduleController,
  NeighFinanceController,
} from './controllers';
import {
  ChargeService,
  FeeScheduleService,
  NeighFinanceService,
} from './services';
import { HousingUnitsModule } from '@modules/housing-units';
import { TaskService } from './services/task.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      FeeSchedule,
      Expense,
      Charge,
      Payment,
      PaymentApplication,
      Transaction,
    ]),
    HousingUnitsModule,
  ],
  controllers: [
    NeighFinanceController,
    FeeScheduleController,
    ChargesController,
  ],
  providers: [
    NeighFinanceService,
    FeeScheduleService,
    ChargeService,
    TaskService,
  ],
})
export class NeighFinanceModule {}
