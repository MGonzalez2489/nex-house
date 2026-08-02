import { Neighborhood } from '@core/database';
import { CurrentNeigh } from '@core/decorators';
import { SearchDto } from '@core/dtos';
import { NeighborhoodScopeGuard } from '@core/guards';
import { UnitToModelMapper } from '@core/mappers';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UnitSearchService } from '../services';

@Controller('neighborhood/:neighborhoodId/units')
@UseGuards(NeighborhoodScopeGuard)
export class UnitsController {
  constructor(private readonly searchService: UnitSearchService) {}

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
