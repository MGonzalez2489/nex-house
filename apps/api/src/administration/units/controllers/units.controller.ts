import { Neighborhood, User } from '@core/database';
import { CurrentNeigh, CurrentUser } from '@core/decorators';
import { SearchDto } from '@core/dtos';
import { NeighborhoodScopeGuard } from '@core/guards';
import { UnitToModelMapper } from '@core/mappers';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateUnitDto } from '../../neighborhood/dtos';
import { UnitSearchService, UnitService } from '../services';

@Controller('neighborhood/:neighborhoodId/units')
@UseGuards(NeighborhoodScopeGuard)
export class UnitsController {
  constructor(
    private readonly searchService: UnitSearchService,
    private readonly unitService: UnitService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateUnitDto,
    @CurrentNeigh() neigh: Neighborhood,
    @CurrentUser() user: User,
  ) {
    return this.unitService.create(neigh.id, dto, user.id);
  }

  @Get()
  async findAll(@Query() dto: SearchDto, @CurrentNeigh() neigh: Neighborhood) {
    const response = await this.searchService.findAll(dto, neigh.id);

    const mResponse = {
      ...response,
      data: response.data.map((f) => UnitToModelMapper(f)),
    };
    return mResponse;
  }

  @Get('stats')
  async findStats(@CurrentNeigh() neigh: Neighborhood) {
    return this.searchService.findStats(neigh.id);
  }
}
