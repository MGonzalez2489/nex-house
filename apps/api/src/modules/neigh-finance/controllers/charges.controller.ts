import { CurrentNeigh, CurrentUser } from '@common/decorators';
import { SearchChargeDto } from '@common/dtos';
import { Neighborhood, User } from '@database/entities';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ChargeCancelDto, ChargeConfirmDto } from '../dtos';
import { ChargeToModel } from '../mappers';
import { ChargeService } from '../services';

@Controller('neighborhoods/:neighborhoodId/charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargeService) {}

  @Get()
  async findAll(
    @CurrentNeigh() neigh: Neighborhood,
    @Query() dto: SearchChargeDto,
  ) {
    const result = await this.chargesService.findAll(neigh.id, dto);

    return {
      meta: result.meta,
      data: result.data.map((fee) => ChargeToModel(fee)),
    };
  }

  @Get('summary')
  async findSummary(
    @CurrentNeigh() neigh: Neighborhood,
    @Query() dto: SearchChargeDto,
  ) {
    return this.chargesService.getSummary(neigh.id, dto);
  }

  @Get(':publicId')
  async getById(
    @CurrentNeigh() neigh: Neighborhood,
    @Param('publicId', ParseUUIDPipe) publicId: string,
  ) {
    const response = await this.chargesService.findByPublicId(
      publicId,
      neigh.id,
    );

    if (!response) {
      throw new NotFoundException(`Charge ${publicId} not found.`);
    }

    return ChargeToModel(response);
  }

  @Post(':publicId/confirm')
  async confirmPayment(
    @CurrentNeigh() neigh: Neighborhood,
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentUser() user: User,
    @Body() dto: ChargeConfirmDto,
  ) {
    const response = await this.chargesService.confirmPayment(
      publicId,
      neigh.id,
      user,
      dto,
    );
    return ChargeToModel(response);
  }
  @Post(':publicId/cancel')
  async cancelPayment(
    @CurrentNeigh() neigh: Neighborhood,
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentUser() user: User,
    @Body() dto: ChargeCancelDto,
  ) {
    const response = await this.chargesService.cancelPayment(
      publicId,
      neigh.id,
      dto.cancelReason,
      user,
    );
    if (!response) {
      throw new NotFoundException(`Charge ${publicId} not found.`);
    }
    return ChargeToModel(response);
  }
}
