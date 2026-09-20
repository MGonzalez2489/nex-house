import { NeighStreet, User } from '@core/database';
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
import { NeighborhoodSearchService, NeighStreetService } from '../services';
import { NeighborhoodToModelMapper } from '@core/mappers';
import { NeighborhoodModel } from '@nexhouse/shared-domain/models';

@ApiTags('Neighborhood')
@Controller('neighborhood')
export class NeighSearchController {
  constructor(
    private readonly searchService: NeighborhoodSearchService,
    private readonly streetService: NeighStreetService,
  ) {}

  /**
   * Returns a paginated list of neighborhoods mapped to API models.
   *
   * @param searchDto Query criteria (pagination, ordering, global filter, state).
   */
  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(60 * 5) // 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a paginated list of neighborhoods' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of neighborhoods.',
  })
  async findAll(
    @Query() searchDto: SearchNeighDto,
  ): Promise<PaginatedResult<NeighborhoodModel>> {
    const response = await this.searchService.findAll(searchDto);

    return {
      data: response.data.map((neighborhood) =>
        NeighborhoodToModelMapper(neighborhood),
      ),
      meta: response.meta,
    };
  }

  @Get('mine')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return assigned neighborhood.' })
  @ApiResponse({
    status: 200,
    description: 'Returns the neighborhood details.',
  })
  @ApiResponse({
    status: 404,
    description: 'Target neighborhood record could not be located.',
  })
  async findMine(@CurrentUser() user: User): Promise<NeighborhoodModel> {
    const neighborhood = await this.searchService.findById(
      user.neighborhoodId,
      { streets: true, address: { city: { state: true } } },
    );

    if (!neighborhood) {
      throw new NotFoundException('Neighborhood not assigned.');
    }

    return NeighborhoodToModelMapper(neighborhood);
  }

  @Get('streets')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return paginated streets for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of streets.',
  })
  async findStreets(
    @Query() filters: SearchDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<NeighStreet>> {
    return this.streetService.findAll(user.neighborhoodId, filters);
  }

  /**
   * Returns a single neighborhood matching the public UUID.
   *
   * @param publicId Public UUID of the neighborhood.
   * @throws NotFoundException if no neighborhood matches the public ID.
   */
  @Get(':publicId')
  @HttpCode(HttpStatus.OK)
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
  ): Promise<NeighborhoodModel> {
    const neighborhood = await this.searchService.findByPublicId(publicId, {
      streets: true,
      address: { city: { state: true } },
    });

    if (!neighborhood) {
      throw new NotFoundException(
        `Neighborhood profile with identity "${publicId}" does not exist.`,
      );
    }

    return NeighborhoodToModelMapper(neighborhood);
  }
}
