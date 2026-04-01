import { Module } from '@nestjs/common';
import { FeeScheduleController, NeighFinanceController } from './controllers';
import { FeeScheduleService, NeighFinanceService } from './services';
import {
  Charge,
  Expense,
  FeeSchedule,
  Payment,
  PaymentApplication,
  Transaction,
} from '@database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeeSchedule,
      Expense,
      Charge,
      Payment,
      PaymentApplication,
      Transaction,
    ]),
  ],
  controllers: [NeighFinanceController, FeeScheduleController],
  providers: [NeighFinanceService, FeeScheduleService],
})
export class NeighFinanceModule {}
