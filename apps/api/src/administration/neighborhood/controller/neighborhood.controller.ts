import { Neighborhood, NeighStreet, User } from '@core/database';
import { CurrentUser } from '@core/decorators';
import {
  HttpCacheInterceptor,
  IdempotencyInterceptor,
} from '@core/interceptors';
import { PaginatedResult } from '@core/utils';
import { CacheTTL } from '@nestjs/cache-manager';
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateNeighborhoodDto,
  SearchNeighDto,
  UpdateNeighborhoodDto,
} from '../dtos';
import {
  NeighborhoodSearchService,
  NeighborhoodService,
  NeighStreetService,
} from '../services';

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
    @Query() searchDto: SearchNeighDto,
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
   * Updates an existing neighborhood and its associated streets.
   * Handles street additions, updates, and removals within a transaction.
   *
   * @param publicId The public ID of the neighborhood to update.
   * @param updateNeighborhoodDto Data payload capturing changes to neighborhood and streets.
   * @param user The active operational user session triggering the update context.
   * @returns The fully populated, updated Neighborhood entity tree structure.
   */
  @Patch(':publicId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Update an existing neighborhood' })
  @ApiResponse({
    status: 200,
    description: 'Neighborhood updated successfully.',
    type: Neighborhood,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or street public ID mismatch.',
  })
  @ApiResponse({
    status: 404,
    description: 'Target neighborhood record could not be located.',
  })
  @ApiResponse({
    status: 409,
    description: 'The proposed neighborhood name already exists.',
  })
  async update(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body() updateNeighborhoodDto: UpdateNeighborhoodDto,
    @CurrentUser() user: User,
  ): Promise<Neighborhood> {
    return await this.service.update(publicId, updateNeighborhoodDto, user);
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
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.streetService.remove(publicId, user.id);
  }
}
