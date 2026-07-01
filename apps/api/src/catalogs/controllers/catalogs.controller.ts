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
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { CatalogsService } from '../services';
import { BaseCatalog } from '@core/database/entities/_base';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Catalogs')
@Controller('catalogs')
@UseInterceptors(CacheInterceptor)
export class CatalogsController {
  constructor(private readonly service: CatalogsService) {}

  /**
   * Retrieves all registered systemic user role types.
   *
   * @returns An array mapping core user role configurations.
   */
  @Get('user_roles')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @ApiOperation({ summary: 'Retrieve user roles catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findUserRoles(): Promise<BaseCatalog[]> {
    return this.service.findAll(UserRole);
  }

  /**
   * Retrieves all available global profile status definitions.
   *
   * @returns An array mapping user state boundaries.
   */
  @Get('user_statuses')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve user statuses catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findUserStatuses(): Promise<BaseCatalog[]> {
    return this.service.findAll(UserStatus);
  }

  /**
   * Retrieves transactional role link definitions between users and functional units.
   *
   * @returns An array mapping tenant unit relation roles.
   */
  @Get('user_unit_roles')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve user unit roles catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findUserUnitRoles(): Promise<BaseCatalog[]> {
    return this.service.findAll(UserUnitRole);
  }

  /**
   * Retrieves the physical and operational states assigned to real-estate entities.
   *
   * @returns An array mapping property status values.
   */
  @Get('unit_statuses')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve unit statuses catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findUnitStatuses(): Promise<BaseCatalog[]> {
    return this.service.findAll(UnitStatus);
  }

  /**
   * Retrieves architectural design definitions categorizing housing units.
   *
   * @returns An array mapping structural unit layout schemas.
   */
  @Get('unit_types')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve unit types catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findUnitType(): Promise<BaseCatalog[]> {
    return this.service.findAll(UnitType);
  }

  /**
   * Retrieves origin vectors tracking incoming or outgoing ledger transactions.
   *
   * @returns An array mapping system interaction environments.
   */
  @Get('transaction_sources')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve transaction sources catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findTransactionSources(): Promise<BaseCatalog[]> {
    return this.service.findAll(TransactionSource);
  }

  /**
   * Retrieves balance categorization structures dividing cashflow streams.
   *
   * @returns An array mapping ledger classification constants.
   */
  @Get('transaction_types')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve transaction types catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findTransactionTypes(): Promise<BaseCatalog[]> {
    return this.service.findAll(TransactionType);
  }

  /**
   * Retrieves invoice lifecycle verification flags mapping treasury operations.
   *
   * @returns An array mapping payment execution states.
   */
  @Get('payment_statuses')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve payment statuses catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findPaymentStatuses(): Promise<BaseCatalog[]> {
    return this.service.findAll(PaymentStatus);
  }

  /**
   * Retrieves the current management states mapping maintenance fee invoices.
   *
   * @returns An array mapping fee balance states.
   */
  @Get('fee_statuses')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve fee statuses catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findFeeStatuses(): Promise<BaseCatalog[]> {
    return this.service.findAll(FeeStatus);
  }

  /**
   * Retrieves debt collection state indicators mapping user statement obligations.
   *
   * @returns An array mapping compound charge lifecycles.
   */
  @Get('charge_statuses')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve charge statuses catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findChargeStatuses(): Promise<BaseCatalog[]> {
    return this.service.findAll(ChargeStatus);
  }
}
