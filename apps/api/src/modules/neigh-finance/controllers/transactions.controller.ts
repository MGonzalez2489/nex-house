import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from '../services';
import { SearchTransactionDto } from '@common/dtos';
import { CurrentNeigh } from '@common/decorators';
import { Neighborhood } from '@database/entities';
import { TransactionToModel } from '../mappers';
import { CreateTransactionDto } from '../dtos';
import { StorageProvider } from '@modules/storage/providers';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile as IUploadedFile } from '@storage/providers';

@ApiTags('Transactions')
@Controller('neighborhoods/:neighborhoodId/transactions')
export class TransactionsController {
  constructor(
    private readonly transactionService: TransactionsService,
    @Inject('STORAGE_PROVIDER') private readonly storage: StorageProvider,
  ) {}

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
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    return this.transactionService.getKpis(neigh.id, obj.month, obj.year);
  }

  @Post()
  @UseInterceptors(FileInterceptor('evidence'))
  async create(
    @Body() dto: CreateTransactionDto,
    @CurrentNeigh() neigh: Neighborhood,
    @UploadedFile() file?: IUploadedFile,
  ) {
    let evidenceUrl = undefined;
    if (file) {
      evidenceUrl = await this.storage.upload(file, 'evidences');
    }

    const response = await this.transactionService.create(
      neigh.id,
      dto,
      evidenceUrl,
    );

    return TransactionToModel(response);
  }
}
