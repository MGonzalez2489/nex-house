import { SearchDto } from '@common/dtos';
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BulkCreateHousingUnitDto, CreateHousingUnitDto } from './dtos';
import { HousingUnitsService } from './housing-units.service';

@ApiTags('Housing Units')
@Controller('neighborhoods/:neighborhoodId/units')
export class HousingUnitsController {
  constructor(private readonly housingUnitsService: HousingUnitsService) {}

  @Post('bulk')
  @ApiOperation({ summary: 'Generate multiple housing units in bulk' })
  @ApiResponse({ status: 201, description: 'Units generated successfully.' })
  async bulkCreate(
    @Param('neighborhoodId', ParseUUIDPipe) neighborhoodId: string,
    @Body() bulkDto: BulkCreateHousingUnitDto,
  ) {
    return await this.housingUnitsService.bulkCreate(neighborhoodId, bulkDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a single housing unit' })
  async create(
    @Param('neighborhoodId', ParseUUIDPipe) neighborhoodId: string,
    @Body() createDto: CreateHousingUnitDto,
  ) {
    return await this.housingUnitsService.create(neighborhoodId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units for a specific neighborhood' })
  async findAll(
    @Param('neighborhoodId', ParseUUIDPipe) neighborhoodId: string,
    @Query() searchDto: SearchDto,
  ) {
    return await this.housingUnitsService.findAll(neighborhoodId, searchDto);
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Get unit details by public ID' })
  async findOne(@Param('publicId', ParseUUIDPipe) publicId: string) {
    return await this.housingUnitsService.findByPublicId(publicId);
  }

  @Patch(':publicId')
  @ApiOperation({ summary: 'Update housing unit details' })
  async update(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body() updateDto: Partial<CreateHousingUnitDto>,
  ) {
    return await this.housingUnitsService.update(publicId, updateDto);
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a housing unit' })
  async remove(@Param('publicId', ParseUUIDPipe) publicId: string) {
    return await this.housingUnitsService.remove(publicId);
  }
}
