import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NeighborhoodsService } from './neighborhoods.service';
import { SearchDto } from '@common/dtos';
import { PaginatedResult } from '@common/utils';
import { Neighborhood, User } from '@database/entities';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateNeighborhoodDto } from './dtos';
import { CurrentUser } from '@common/decorators';

@ApiTags('Neighborhoods')
@Controller('neighborhoods')
export class NeighborhoodsController {
  constructor(private readonly neighborhoodsService: NeighborhoodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new neighborhood' })
  @ApiResponse({
    status: 201,
    description: 'Neighborhood created successfully.',
    type: Neighborhood,
  })
  async create(
    @Body() createNeighborhoodDto: CreateNeighborhoodDto,
    @CurrentUser() user: User,
  ): Promise<Neighborhood> {
    return await this.neighborhoodsService.create(createNeighborhoodDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of neighborhoods' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of neighborhoods.',
  })
  async findAll(
    @Query() searchDto: SearchDto,
  ): Promise<PaginatedResult<Neighborhood>> {
    return await this.neighborhoodsService.findAll(searchDto);
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Find a neighborhood by its public ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the neighborhood details.',
  })
  @ApiResponse({ status: 404, description: 'Neighborhood not found.' })
  @ApiOperation({ summary: 'Obtener un fraccionamiento por su ID público' })
  async findOne(
    @Param('publicId', ParseUUIDPipe) publicId: string,
  ): Promise<Neighborhood | null> {
    return this.neighborhoodsService.findByPublicId(publicId);
  }

  @Patch(':publicId')
  @ApiOperation({ summary: 'Update an existing neighborhood' })
  @ApiResponse({
    status: 200,
    description: 'Neighborhood updated successfully.',
  })
  async update(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body() updateNeighborhoodDto: CreateNeighborhoodDto, // O tu UpdateDto si lo separaste
    @CurrentUser() user: User,
  ): Promise<Neighborhood> {
    return await this.neighborhoodsService.update(
      publicId,
      updateNeighborhoodDto,
      user,
    );
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a neighborhood' })
  @ApiResponse({
    status: 204,
    description: 'Neighborhood deleted successfully.',
  })
  async remove(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return await this.neighborhoodsService.remove(publicId, user);
  }
}
