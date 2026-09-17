import { Neighborhood, Unit, User } from '@core/database';
import { CurrentNeigh, CurrentUser } from '@core/decorators';
import { SearchDto } from '@core/dtos';
import { NeighborhoodScopeGuard } from '@core/guards';
import { UnitToModelMapper } from '@core/mappers';
import { PaginatedResult } from '@core/utils';
import { UnitStats } from '@nexhouse/shared-domain/interfaces';
import { UnitModel } from '@nexhouse/shared-domain/models';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUnitDto } from '../dtos';
import { UnitSearchService, UnitService } from '../services';

@ApiTags('Units')
@Controller('neighborhood/:neighborhoodId/units')
@UseGuards(NeighborhoodScopeGuard)
export class UnitsController {
  constructor(
    private readonly searchService: UnitSearchService,
    private readonly unitService: UnitService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a unit in the neighborhood' })
  @ApiResponse({
    status: 201,
    description: 'Unit created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload, street scope or missing catalogs.',
  })
  @ApiResponse({
    status: 409,
    description: 'A unit with the same identifier already exists.',
  })
  async create(
    @Body() dto: CreateUnitDto,
    @CurrentNeigh() neigh: Neighborhood,
    @CurrentUser() user: User,
  ): Promise<Unit> {
    return this.unitService.create(neigh.id, dto, user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List units of the neighborhood' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of units.',
  })
  async findAll(
    @Query() dto: SearchDto,
    @CurrentNeigh() neigh: Neighborhood,
  ): Promise<PaginatedResult<UnitModel>> {
    const response = await this.searchService.findAll(dto, neigh.id);

    return {
      ...response,
      data: response.data.map((unit) => UnitToModelMapper(unit)),
    };
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return unit statistics for the neighborhood' })
  @ApiResponse({
    status: 200,
    description: 'Returns aggregated unit counts by status, type and street.',
  })
  async findStats(@CurrentNeigh() neigh: Neighborhood): Promise<UnitStats> {
    return this.searchService.findStats(neigh.id);
  }
}
