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
   * Creates a new neighborhood atomically with its streets and first admin.
   *
   * @param dto Neighborhood payload (name, streets, admin email, location).
   * @param user Authenticated actor creating the neighborhood.
   * @returns The created neighborhood with its relations.
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
    return this.service.create(createNeighborhoodDto, user);
  }

  /**
   * Updates an existing neighborhood, adding/updating/removing its streets
   * within a single transaction.
   *
   * @param publicId Public UUID of the neighborhood to update.
   * @param updateNeighborhoodDto Mutable neighborhood fields.
   * @param user Authenticated actor performing the update.
   * @returns The updated neighborhood with its relations.
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
    return this.service.update(publicId, updateNeighborhoodDto, user);
  }
}
