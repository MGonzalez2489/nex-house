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
import { CurrentUser } from '@common/decorators';
import { User } from '@database/entities';
import { UnitArrayToModelArray, UnitEntityToModel } from './mappers';

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
    @CurrentUser() user: User,
  ) {
    const response = await this.housingUnitsService.bulkCreate(
      neighborhoodId,
      bulkDto,
      user,
    );

    return UnitArrayToModelArray(response);
  }

  @Post()
  @ApiOperation({ summary: 'Create a single housing unit' })
  async create(
    @Param('neighborhoodId', ParseUUIDPipe) neighborhoodId: string,
    @Body() createDto: CreateHousingUnitDto,
    @CurrentUser() user: User,
  ) {
    const response = await this.housingUnitsService.create(
      neighborhoodId,
      createDto,
      user,
    );

    return UnitEntityToModel(response);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units for a specific neighborhood' })
  async findAll(
    @Param('neighborhoodId', ParseUUIDPipe) neighborhoodId: string,
    @Query() searchDto: SearchDto,
  ) {
    const response = await this.housingUnitsService.findAll(
      neighborhoodId,
      searchDto,
    );

    return {
      meta: response.meta,
      data: UnitArrayToModelArray(response.data),
    };
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
    @CurrentUser() user: User,
  ) {
    const response = await this.housingUnitsService.update(
      publicId,
      updateDto,
      user,
    );
    return UnitEntityToModel(response);
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a housing unit' })
  async remove(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentUser() user: User,
  ) {
    return await this.housingUnitsService.remove(publicId, user);
  }
}
