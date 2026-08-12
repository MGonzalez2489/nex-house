import {
  ChargeStatus,
  City,
  Country,
  FeeStatus,
  PaymentStatus,
  State,
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
  Param,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CatalogsService } from '../services';
import { BaseCatalog } from '@core/database/entities/_base';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';
import { Not } from 'typeorm';

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
    return this.service.findAll(UserRole, {
      where: { name: Not(UserRoleEnum.SUPERADMIN) },
    });
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
  /////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Retrieves all registered countries.
   *
   * @returns An array of countries.
   */
  @Get('countries')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve countries catalog data' })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findCountries(): Promise<Country[]> {
    return this.service.findAll(Country);
  }

  /**
   * Retrieves states based on a specific country ID.
   *
   * @param countryId The ID of the country.
   * @returns An array of states belonging to the specified country.
   */
  @Get('states/:countryId')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve states by country ID' })
  @ApiParam({
    name: 'countryId',
    type: 'UUID',
    description: 'ID of the country to retrieve states for',
  })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findStatesByCountryId(
    @Param('countryId', ParseUUIDPipe) countryId: string,
  ): Promise<State[]> {
    const country = await this.service.findByPublicId(Country, countryId);
    return this.service.findAll(State, { where: { countryId: country.id } });
  }

  /**
   * Retrieves cities based on a specific state ID.
   *
   * @param stateId The ID of the state.
   * @returns An array of cities belonging to the specified state.
   */
  @Get('cities/:stateId')
  @CacheTTL(60 * 60 * 24) //TTL 24 hours
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve cities by state ID' })
  @ApiParam({
    name: 'stateId',
    type: 'UUID',
    description: 'ID of the state to retrieve cities for',
  })
  @ApiResponse({
    status: 200,
    description: 'Catalog records fetched successfully.',
  })
  async findCitiesByStateId(
    @Param('stateId', ParseUUIDPipe) stateId: string,
  ): Promise<City[]> {
    const state = await this.service.findByPublicId(State, stateId);
    return this.service.findAll(City, { where: { stateId: state.id } });
  }
}
