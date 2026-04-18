import { CurrentNeigh, CurrentUser } from '@common/decorators';
import { Neighborhood, User } from '@database/entities';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateFeeScheduleDto } from '../dtos';
import { FeeScheduleService } from '../services';
import { SearchDto } from '@common/dtos';
import { FeeScheduleToModel } from '../mappers';

@Controller('neighborhoods/:neighborhoodId/fee-schedule')
export class FeeScheduleController {
  constructor(private readonly feeScheduleService: FeeScheduleService) {}

  @Post()
  async createSchedule(
    @Body() dto: CreateFeeScheduleDto,
    @CurrentNeigh() neigh: Neighborhood,
    @CurrentUser() user: User,
  ) {
    const response = await this.feeScheduleService.create(
      dto,
      neigh.id,
      user.id,
    );
    return FeeScheduleToModel(response);
  }

  @Get()
  async findAll(@CurrentNeigh() neigh: Neighborhood, @Query() dto: SearchDto) {
    return this.feeScheduleService.findAll(neigh.id, dto);

    // return {
    //   meta: result.meta,
    //   data: result.data.map((fee) => FeeScheduleToModel(fee)),
    // };
  }

  @Get(':publicId')
  async findOne(@Param('publicId') publicId: string) {
    const response = await this.feeScheduleService.findOne(publicId);
    return FeeScheduleToModel(response);
  }
}
