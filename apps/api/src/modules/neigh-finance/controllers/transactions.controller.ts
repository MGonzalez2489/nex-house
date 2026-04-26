import { CurrentNeigh, CurrentUser } from '@common/decorators';
import { SearchTransactionDto } from '@common/dtos';
import { Neighborhood, User } from '@database/entities';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { UploadedFile as IUploadedFile } from '@storage/providers';
import { CreateTransactionDto, UpdateTransactionDto } from '../dtos';
import { TransactionToModel } from '../mappers';
import { TransactionsService } from '../services';

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
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    return this.transactionService.getKpis(neigh.id, obj.month, obj.year);
  }

  @Post()
  @UseInterceptors(FileInterceptor('evidence'))
  async create(
    @Body() dto: CreateTransactionDto,
    @CurrentNeigh() neigh: Neighborhood,
    @CurrentUser() user: User,
    @UploadedFile() file?: IUploadedFile,
  ) {
    const response = await this.transactionService.create(
      neigh.id,
      dto,
      user,
      file,
    );

    if (!response) {
      throw new InternalServerErrorException('Creation result not valid');
    }

    return TransactionToModel(response);
  }

  @Patch(':publicId')
  update(
    @Param('publicId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() user: User,
    @UploadedFile() file?: IUploadedFile,
  ) {
    return this.transactionService.update(id, dto, user, file);
  }

  @Delete(':publicId')
  async remove(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentUser() user: User,
  ) {
    const response = await this.transactionService.voidTransaction(
      publicId,
      user,
    );

    if (!response)
      throw new InternalServerErrorException('Remove result not valid');
    if (!response.original)
      throw new InternalServerErrorException('Remove result not valid');
    if (!response.reverse)
      throw new InternalServerErrorException('Remove result not valid');

    return {
      original: TransactionToModel(response.original),
      reverse: TransactionToModel(response.reverse),
    };
  }
}
