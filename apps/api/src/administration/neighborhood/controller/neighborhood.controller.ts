import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { NeighborhoodSearchService, NeighborhoodService } from '../services';
import { Neighborhood, User } from '@core/database';
import { SearchDto } from '@core/dtos';
import { PaginatedResult } from '@core/utils';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateNeighborhoodDto } from '../dtos';
import { CurrentUser } from '@core/decorators';

@Controller('neighborhood')
export class NeighborhoodController {
  constructor(
    private readonly searchService: NeighborhoodSearchService,
    private readonly service: NeighborhoodService,
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
}
