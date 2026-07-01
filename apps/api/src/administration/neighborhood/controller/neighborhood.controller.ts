import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  NeighborhoodSearchService,
  NeighborhoodService,
  NeighStreetService,
} from '../services';
import { Neighborhood, NeighStreet, User } from '@core/database';
import { SearchDto } from '@core/dtos';
import { PaginatedResult } from '@core/utils';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateNeighborhoodDto } from '../dtos';
import { CurrentUser } from '@core/decorators';
import {
  HttpCacheInterceptor,
  IdempotencyInterceptor,
} from '@core/interceptors';
import { CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Neighborhood')
@Controller('neighborhood')
export class NeighborhoodController {
  constructor(
    private readonly searchService: NeighborhoodSearchService,
    private readonly service: NeighborhoodService,
    private readonly streetService: NeighStreetService,
  ) {}

  /**
   * Registers a fresh neighborhood configuration map alongside its relational street index catalogs.
   * Leverages full ACID execution pipelines to guarantee cross-boundary structural safety.
   *
   * @param createNeighborhoodDto Body payload containing name and street list string tokens.
   * @param user Injected operational metadata capturing the current administrative author profile.
   * @returns The fully populated, newly instantiated Neighborhood entity tree structure.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new neighborhood' })
  @UseInterceptors(IdempotencyInterceptor)
  @ApiResponse({
    status: 201,
    description: 'Neighborhood created successfully.',
    type: Neighborhood,
  })
  @ApiResponse({
    status: 400,
    description:
      'The request body payload dropped below structural validation constraints.',
  })
  @ApiResponse({
    status: 409,
    description:
      'The proposed neighborhood identity name already resides in persistent records.',
  })
  async create(
    @Body() createNeighborhoodDto: CreateNeighborhoodDto,
    @CurrentUser() user: User,
  ): Promise<Neighborhood> {
    return await this.service.create(createNeighborhoodDto, user);
  }

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
    @Query() searchDto: SearchDto,
  ): Promise<PaginatedResult<Neighborhood>> {
    return this.searchService.findAll(searchDto);
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

  /////////////////////////
  // NEIGH streets
  ////////////////////////

  /**
   * Appends a sub-collection of fresh street entries linked to an active parent neighborhood row.
   *
   * @param publicId Parent neighborhood secure UUID token mapping.
   * @param body Payload mapping array of street names to insert.
   */
  @Post(':publicId/streets')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Add new streets to an existing neighborhood' })
  @ApiResponse({
    status: 201,
    description: 'Streets successfully appended to target context.',
    type: [NeighStreet],
  })
  @ApiResponse({
    status: 404,
    description: 'Parent neighborhood context could not be located.',
  })
  async addStreets(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body('streets') streets: string[],
  ): Promise<NeighStreet[]> {
    const neighborhood = await this.searchService.findByPublicId(publicId);
    if (!neighborhood) {
      throw new NotFoundException(
        `Parent neighborhood identity "${publicId}" does not exist.`,
      );
    }

    const payload = streets.map((street) => ({
      name: street.trim().toLocaleLowerCase(),
      neighborhoodId: neighborhood.id,
    }));

    return await this.streetService.createMany(payload);
  }

  /**
   * Mutates properties belonging to a specific unique street entry.
   *
   * @param streetUuid Specific target street secure token identifier.
   * @param name Fresh descriptive title mapping configuration.
   */
  @Patch('streets/:publicId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Update a specific street name' })
  @ApiResponse({
    status: 200,
    description: 'Street entity mutated successfully.',
    type: NeighStreet,
  })
  @ApiResponse({
    status: 404,
    description: 'Target street record could not be located.',
  })
  async updateStreet(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body('name') name: string,
  ): Promise<NeighStreet> {
    return await this.streetService.update(publicId, name);
  }

  /**
   * Evicts a street data row permanently from persistence layouts.
   *
   * @param streetUuid Specific target street secure token identifier to remove.
   */
  @Delete('streets/:publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Remove a street from a neighborhood permanently' })
  @ApiResponse({
    status: 24,
    description: 'Street entry successfully removed from structural pools.',
  })
  @ApiResponse({
    status: 404,
    description: 'Target street record could not be located.',
  })
  async removeStreet(
    @Param('publicId', ParseUUIDPipe) publicId: string,
  ): Promise<void> {
    await this.streetService.remove(publicId);
  }
}
