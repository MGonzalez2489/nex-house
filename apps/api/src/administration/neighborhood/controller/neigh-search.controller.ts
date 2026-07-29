import { Neighborhood, NeighStreet, Unit, User } from '@core/database';
import { CurrentUser } from '@core/decorators';
import { SearchDto } from '@core/dtos';
import { HttpCacheInterceptor } from '@core/interceptors';
import { PaginatedResult } from '@core/utils';
import { CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchNeighDto } from '../dtos';
import {
  NeighborhoodSearchService,
  NeighStreetService,
  NeighUnitsService,
} from '../services';

@ApiTags('Neighborhood')
@Controller('neighborhood')
export class NeighSearchController {
  constructor(
    private readonly searchService: NeighborhoodSearchService,
    private readonly streetService: NeighStreetService,
    private readonly unitService: NeighUnitsService,
  ) {}

  /**
   * Exposes a public query-driven endpoint returning validated, paginated listings of neighborhood profiles.
   *
   * @param searchDto Injected query payload processing validation and bounds criteria.
   * @returns Structured object wrapping data arrays and pagination headers.
   */
  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(60 * 5) //5 mins cache
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a paginated list of neighborhoods' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of neighborhoods.',
  })
  async findAll(
    @Query() searchDto: SearchNeighDto,
  ): Promise<PaginatedResult<Neighborhood>> {
    return this.searchService.findAll(searchDto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Return assigned neighborhood.' })
  @ApiResponse({
    status: 200,
    description: 'Returns the neighborhood details.',
  })
  @ApiResponse({
    status: 404,
    description: 'Target neighborhood record could not be located.',
  })
  async findMine(@CurrentUser() user: User): Promise<Neighborhood> {
    const neighborhood = await this.searchService.findById(
      user.neighborhoodId,
      { streets: true },
    );

    if (!neighborhood) {
      throw new NotFoundException(`Neighborhood not assigned.`);
    }

    return neighborhood;
  }

  @Get('units')
  async findUnits(
    @Query() filters: SearchDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<Unit>> {
    return this.unitService.findAll(user.neighborhoodId, filters);
  }

  @Get('streets')
  async findStreets(
    @Query() filters: SearchDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<NeighStreet>> {
    return this.streetService.findAll(user.neighborhoodId, filters);
  }

  /**
   * Resolves specific tenant configuration structures mapped exclusively against cross-boundary UUID tokens.
   *
   * @param publicId String UUID validated inline prior to interceptor handoff.
   * @throws NotFoundException if the service layer resolves a null pointer reference.
   * @returns Completed entity mapping profiles.
   */
  @Get(':publicId')
  @ApiOperation({ summary: 'Return a neighborhood by publicId.' })
  @ApiResponse({
    status: 200,
    description: 'Returns the neighborhood details.',
  })
  @ApiResponse({
    status: 404,
    description: 'Target neighborhood record could not be located.',
  })
  async findOne(
    @Param('publicId', ParseUUIDPipe) publicId: string,
  ): Promise<Neighborhood> {
    const neighborhood = await this.searchService.findByPublicId(publicId);

    if (!neighborhood) {
      throw new NotFoundException(
        `Neighborhood profile with identity "${publicId}" does not exist.`,
      );
    }

    return neighborhood;
  }
}
