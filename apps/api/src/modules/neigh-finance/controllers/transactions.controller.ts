import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from '../services';
import { SearchTransactionDto } from '@common/dtos';
import { CurrentNeigh } from '@common/decorators';
import { Neighborhood } from '@database/entities';
import { TransactionToModel } from '../mappers';
import { CreateTransactionDto } from '../dtos';

@ApiTags('Transactions')
@Controller('neighborhoods/:neighborhoodId/transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Get()
  async getJournal(
    @Query() filters: SearchTransactionDto,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    const response = await this.transactionService.findAll(neigh.id, filters);
    return {
      meta: response.meta,
      data: response.data.map((f) => TransactionToModel(f)),
    };
  }

  @Get('summary')
  async getSummary(
    @Query() obj: { month: number; year: number },
    // @Query() month: number,
    // @Query() year: number,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    return this.transactionService.getKpis(neigh.id, obj.month, obj.year);
  }

  @Post()
  async create(
    @Body() dto: CreateTransactionDto,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    const response = await this.transactionService.create(neigh.id, dto);

    return TransactionToModel(response);
  }
}
