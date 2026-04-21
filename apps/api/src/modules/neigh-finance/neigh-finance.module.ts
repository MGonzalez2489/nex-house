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
  TransactionsController,
} from './controllers';
import {
  ChargeService,
  FeeScheduleService,
  NeighFinanceService,
  TransactionsService,
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
    TransactionsController,
  ],
  providers: [
    NeighFinanceService,
    FeeScheduleService,
    ChargeService,
    TaskService,
    TransactionsService,
  ],
})
export class NeighFinanceModule {}
