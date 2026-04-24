import { SearchTransactionDto } from '@common/dtos';
import { paginateQuery } from '@common/utils';
import { Transaction, User } from '@database/entities';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TransactionSourceTypeEnum,
  TransactionTypeEnum,
} from '@nex-house/enums';
import { TransactionKpiModel } from '@nex-house/models';
import { Brackets, Repository } from 'typeorm';
import { CreateTransactionDto } from '../dtos';
import { CategoriesService } from '@modules/catalogs';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
    private readonly categoryService: CategoriesService,
  ) {}

  private async getById(id: number) {
    return await this.repository.findOne({
      where: { id },
      relations: ['createdByUser', 'category'],
    });
  }

  async create(
    neighborhoodId: number,
    dto: CreateTransactionDto,
    creator: User,
    evidenceUrl?: string,
  ) {
    const type =
      dto.type === 'income'
        ? TransactionTypeEnum.INCOME
        : TransactionTypeEnum.EXPENSE;

    //TODO: this?
    const source = TransactionSourceTypeEnum.EXPENSE;

    const cat = await this.categoryService.findOne(dto.category);
    if (!cat) {
      throw new BadRequestException(`Category ${dto.category} not found.`);
    }

    const newRecord = {
      type,
      amount: dto.amount,
      title: dto.title,
      description: dto.description,
      sourceType: source,
      neighborhoodId,
      transactionDate: dto.transactionDate.toString(),
      evidenceUrl,
      createdBy: creator.id,
      categoryId: cat.id, //TODO: FIX THIS
    };

    const transaction = this.repository.create(newRecord);

    await this.repository.save(transaction);
    return this.getById(transaction.id);
  }

  async getKpis(
    neighborhoodId: number,
    month: number,
    year: number,
  ): Promise<TransactionKpiModel> {
    const stats = await this.repository
      .createQueryBuilder('t')
      .select([
        "SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END) AS balance",
        "SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS income",
        "SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS expense",
        'COUNT(*) AS totalCount',
        "COUNT(CASE WHEN t.type = 'income' THEN 1 END) AS incomeCount",
        "COUNT(CASE WHEN t.type = 'expense' THEN 1 END) AS expenseCount",
      ])
      .where('t.neighborhoodId = :neighborhoodId', { neighborhoodId })
      .andWhere('EXTRACT(MONTH FROM t.transactionDate) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM t.transactionDate) = :year', { year })
      .getRawOne();

    return {
      balance: parseFloat(stats.balance || 0) / 1000,
      income: parseFloat(stats.income || 0) / 1000,
      expense: parseFloat(stats.expense || 0) / 1000,
      totalCount: parseInt(stats.totalCount || 0),
      incomeCount: parseInt(stats.incomeCount || 0),
      expenseCount: parseInt(stats.expenseCount || 0),
    };

    // // Calculamos el balance total (histórico)
    // const totalBalance = await this.repository
    //   .createQueryBuilder('t')
    //   .select(
    //     "SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)",
    //     'balance',
    //   )
    //   .where('t.neighborhoodId = :neighborhoodId', { neighborhoodId })
    //   .andWhere('EXTRACT(MONTH FROM t.transactionDate) = :month', { month })
    //   .andWhere('EXTRACT(YEAR FROM t.transactionDate) = :year', { year })
    //   .getRawOne();
    //
    // // Calculamos ingresos y egresos del mes específico
    // const monthStats = await this.repository
    //   .createQueryBuilder('t')
    //   .select(
    //     "SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END)",
    //     'income',
    //   )
    //   .addSelect(
    //     "SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END)",
    //     'expense',
    //   )
    //   .where('t.neighborhoodId = :neighborhoodId', { neighborhoodId })
    //   .andWhere('EXTRACT(MONTH FROM t.transactionDate) = :month', { month })
    //   .andWhere('EXTRACT(YEAR FROM t.transactionDate) = :year', { year })
    //   .getRawOne();
    //
    // const response: TransactionKpiModel = {
    //   balance: parseFloat(totalBalance?.balance || 0) / 1000,
    //   income: parseFloat(monthStats?.income || 0) / 1000,
    //   expense: parseFloat(monthStats?.expense || 0) / 1000,
    // };
    // return response;
  }

  async findAll(neighborhoodId: number, filters: SearchTransactionDto) {
    const query = this.repository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.createdByUser', 'user')
      .leftJoinAndSelect('t.category', 'cat')
      .where('t.neighborhoodId = :neighborhoodId', { neighborhoodId });

    const { globalFilter, category, month, year } = filters;

    // Filtro por Fecha (Mes y Año)
    if (month && year) {
      query
        .andWhere('EXTRACT(MONTH FROM t.transactionDate) = :month', { month })
        .andWhere('EXTRACT(YEAR FROM t.transactionDate) = :year', { year });
    }

    // Filtro por Categoría (SourceType en tu ERD)
    if (category) {
      query.andWhere('t.sourceType = :category', { category });
    }

    // Buscador Global
    if (globalFilter) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('t.description LIKE :filter', {
            filter: `%${globalFilter}%`,
          });
        }),
      );
    }

    // Ordenar siempre por la fecha de transacción más reciente
    query
      .orderBy('t.transactionDate', 'DESC')
      .addOrderBy('t.createdAt', 'DESC');

    return await paginateQuery(query, filters);
  }
}
