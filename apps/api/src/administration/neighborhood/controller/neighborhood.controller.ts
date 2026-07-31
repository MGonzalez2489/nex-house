import { Neighborhood, User } from '@core/database';
import { CurrentUser } from '@core/decorators';
import { IdempotencyInterceptor } from '@core/interceptors';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateNeighborhoodDto, UpdateNeighborhoodDto } from '../dtos';
import { NeighborhoodService } from '../services';

@ApiTags('Neighborhood')
@Controller('neighborhood')
export class NeighborhoodController {
  constructor(private readonly service: NeighborhoodService) {}

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
}
