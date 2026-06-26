import {
  ChargeStatus,
  FeeStatus,
  PaymentStatus,
  TransactionSource,
  TransactionType,
  UnitStatus,
  UnitType,
  UserRole,
  UserStatus,
  UserUnitRole,
} from '@core/database';
import { Controller, Get } from '@nestjs/common';
import { CatalogsService } from '../services';

@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly service: CatalogsService) {}

  @Get('user_roles')
  async findUserRoles() {
    return this.service.findAll(UserRole);
  }
  @Get('user_statuses')
  async findUserStatuses() {
    return this.service.findAll(UserStatus);
  }
  @Get('user_unit_roles')
  async findUserUnitRoles() {
    return this.service.findAll(UserUnitRole);
  }
  @Get('unit_statuses')
  async findUnitStatuses() {
    return this.service.findAll(UnitStatus);
  }
  @Get('unit_types')
  async findUnitType() {
    return this.service.findAll(UnitType);
  }
  @Get('transaction_sources')
  async findTransactionSources() {
    return this.service.findAll(TransactionSource);
  }
  @Get('transaction_types')
  async findTransactionTypes() {
    return this.service.findAll(TransactionType);
  }
  @Get('payment_statuses')
  async findPaymentStatuses() {
    return this.service.findAll(PaymentStatus);
  }
  // @Get('fee_types')
  // async findFeeTypes() {
  //   return this.service.findAll(FeeType);
  // }
  @Get('fee_statuses')
  async findFeeStatuses() {
    return this.service.findAll(FeeStatus);
  }
  @Get('charge_statuses')
  async findChargeStatuses() {
    return this.service.findAll(ChargeStatus);
  }
}
