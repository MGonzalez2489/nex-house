import { SearchTransactionDto } from '@common/dtos';
import { paginateQuery } from '@common/utils';
import { Transaction, TransactionCategory, User } from '@database/entities';
import { CategoriesService } from '@modules/catalogs';
import { FileService } from '@modules/storage/services';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TransactionCategoriesEnum,
  TransactionSourceTypeEnum,
  TransactionTypeEnum,
} from '@nex-house/enums';
import { TransactionKpiModel } from '@nex-house/models';
import { UploadedFile as IUploadedFile } from '@storage/providers';
import { Brackets, DataSource, Repository } from 'typeorm';
import { CreateTransactionDto, UpdateTransactionDto } from '../dtos';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
    private readonly categoryService: CategoriesService,
    private readonly fileService: FileService,
    private readonly dataSource: DataSource,
  ) {}

  private async getByPublicId(publicId: string) {
    const record = await this.repository.findOne({
      where: { publicId },
      relations: ['createdByUser', 'category', 'evidence'],
    });

    if (!record) return null;

    if (record.reversedBy) {
      const reverseRecord = await this.getByPublicId(record.publicId);
      if (reverseRecord) {
        record.reversedBy = reverseRecord;
      }
    }
    return record;
  }

  private async getById(id: number) {
    const record = await this.repository.findOne({
      where: { id },
      relations: ['createdByUser', 'category', 'evidence'],
    });

    if (!record) return null;

    if (record.reversedById) {
      const reverseRecord = await this.getById(record.reversedById);
      if (reverseRecord) {
        record.reversedBy = reverseRecord;
      }
    }
    return record;
  }

  async create(
    neighborhoodId: number,
    dto: CreateTransactionDto,
    creator: User,
    evidence?: IUploadedFile,
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

    const fRecord = evidence
      ? await this.fileService.uploadAndRegister(evidence, 'evidence', creator)
      : undefined;

    const newRecord = {
      type,
      amount: dto.amount,
      title: dto.title,
      description: dto.description,
      sourceType: source,
      neighborhoodId,
      transactionDate: dto.transactionDate.toString(),
      evidenceId: fRecord?.id,
      createdBy: creator.id,
      categoryId: cat.id,
    };

    const transaction = this.repository.create(newRecord);

    await this.repository.save(transaction);
    return this.getById(transaction.id);
  }

  async update(
    publicId: string,
    dto: UpdateTransactionDto,
    user: User,
    newFile?: IUploadedFile,
  ): Promise<Transaction | null> {
    const transaction = await this.getByPublicId(publicId);

    if (!transaction) {
      throw new NotFoundException(`Transaction ${publicId} not found.`);
    }

    // 1. Gestión de Categoría
    if (dto.category) {
      const cat = await this.categoryService.findOne(dto.category);
      if (!cat) throw new BadRequestException('Categoría no válida');
      transaction.categoryId = cat.id;
    }

    // 2. Gestión de Evidencia (Archivo)
    if (newFile) {
      // Si ya existía uno, lo eliminamos físicamente y su registro
      if (transaction.evidenceId) {
        await this.fileService.deleteById(transaction.evidenceId);
      }

      // Subimos y registramos el nuevo
      const fRecord = await this.fileService.uploadAndRegister(
        newFile,
        'evidence',
        user,
      );
      transaction.evidenceId = fRecord.id;
    }

    // 3. Mapeo de campos básicos y Auditoría
    Object.assign(transaction, {
      ...dto,
      transactionDate:
        dto.transactionDate?.toString() || transaction.transactionDate,
      updatedBy: user.id, // Campo de auditoría
    });

    await this.repository.save(transaction);

    return this.getByPublicId(publicId);
  }

  async getKpis(
    neighborhoodId: number,
    month: number,
    year: number,
  ): Promise<TransactionKpiModel> {
    const stats = await this.repository
      .createQueryBuilder('t')
      .select([
        // BALANCE: Considera TODO lo activo. Si es reversión, resta el monto.
        `SUM(CASE
              WHEN t.type = 'income' THEN t.amount
              WHEN t.type = 'expense' THEN -t.amount
              WHEN t.type = 'reversal' THEN -t.amount
              ELSE 0
        END) AS balance`,

        // INGRESOS: Solo mes actual, activo y que NO sea reversión (ya que la original se marca isActive=false)
        `SUM(CASE
          WHEN t.type = 'income' AND t.isActive = true AND t.isReversal = false
          AND EXTRACT(MONTH FROM t.transactionDate) = :month
          AND EXTRACT(YEAR FROM t.transactionDate) = :year
          THEN t.amount ELSE 0
        END) AS income`,

        // EGRESOS: Solo mes actual, activo y que NO sea reversión
        `SUM(CASE
          WHEN t.type = 'expense' AND t.isActive = true AND t.isReversal = false
          AND EXTRACT(MONTH FROM t.transactionDate) = :month
          AND EXTRACT(YEAR FROM t.transactionDate) = :year
          THEN t.amount ELSE 0
        END) AS expense`,

        'COUNT(CASE WHEN t.isActive = true AND t.isReversal = false THEN 1 END) AS totalCount',

        `COUNT(CASE
          WHEN t.type = 'income' AND t.isActive = true AND t.isReversal = false
          AND EXTRACT(MONTH FROM t.transactionDate) = :month
          AND EXTRACT(YEAR FROM t.transactionDate) = :year
          THEN 1 END) AS incomeCount`,

        `COUNT(CASE
          WHEN t.type = 'expense' AND t.isActive = true AND t.isReversal = false
          AND EXTRACT(MONTH FROM t.transactionDate) = :month
          AND EXTRACT(YEAR FROM t.transactionDate) = :year
          THEN 1 END) AS expenseCount`,
      ])
      .where('t.neighborhoodId = :neighborhoodId', { neighborhoodId })
      .setParameters({ month, year })
      .getRawOne();

    return {
      balance: parseFloat(stats.balance || 0) / 1000,
      income: parseFloat(stats.income || 0) / 1000,
      expense: parseFloat(stats.expense || 0) / 1000,
      totalCount: parseInt(stats.totalCount || 0),
      incomeCount: parseInt(stats.incomeCount || 0),
      expenseCount: parseInt(stats.expenseCount || 0),
    };
  }

  async findAll(neighborhoodId: number, filters: SearchTransactionDto) {
    const query = this.repository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.createdByUser', 'user')
      .leftJoinAndSelect('t.category', 'cat')
      .leftJoinAndSelect('t.evidence', 'evidence')
      .leftJoinAndSelect('t.reversedBy', 'reversedBy')
      .leftJoinAndSelect('reversedBy.category', 'category')
      .leftJoinAndSelect('reversedBy.createdByUser', 'createdByUser')
      .leftJoinAndSelect('reversedBy.evidence', 'reversedEvidence')
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
      query.andWhere('cat.publicId = :category', { category });
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

    console.log(query.getQueryAndParameters());

    return await paginateQuery(query, filters);
  }

  /**
   * Anula una transacción creando un movimiento inverso.
   * Utiliza QueryRunner para garantizar que ambos pasos ocurran o ninguno.
   */
  async voidTransaction(publicId: string, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const original = await queryRunner.manager.findOne(Transaction, {
        where: {
          publicId,
          // isActive: true
        },
      });

      if (!original) throw new NotFoundException('Transacción no válida.');

      // 1. Determinar el tipo opuesto para compensar el balance
      const reversalType =
        original.type === TransactionTypeEnum.EXPENSE
          ? TransactionTypeEnum.INCOME
          : TransactionTypeEnum.EXPENSE;

      // 2. Buscar una categoría de sistema para "Anulaciones" según el nuevo tipo
      // Nota: Deberías tener categorías pre-configuradas para esto
      const adjustmentCategory = await queryRunner.manager.findOne(
        TransactionCategory,
        {
          where: { name: TransactionCategoriesEnum.CANCELLATION },
        },
      );

      if (!adjustmentCategory) {
        throw new InternalServerErrorException(
          'No se encontró una categoría de ajuste para la anulación.',
        );
      }

      // 3. Crear el contra-movimiento (Siempre positivo)
      const reversal = queryRunner.manager.create(Transaction, {
        neighborhoodId: original.neighborhoodId,
        type: reversalType,
        amount: original.amount, // Valor positivo, el tipo maneja el balance
        sourceType: original.sourceType,
        transactionDate: new Date().toString(),
        title: `[ANULACIÓN] ${original.title}`,
        description: `Compensación por anulación de ticket #${original.publicId}`,
        categoryId: adjustmentCategory.id,
        createdBy: user.id,
        isActive: true,
        isReversal: true,
      });

      const savedReversal = await queryRunner.manager.save(reversal);

      // 4. Vincular y desactivar la original
      original.isActive = false;
      original.reversedById = savedReversal.id;
      original.updatedBy = user.id;

      await queryRunner.manager.save(original);

      await queryRunner.commitTransaction();

      const allTransactions = await Promise.all([
        this.getById(original.id),
        this.getById(reversal.id),
      ]);

      return {
        original: allTransactions[0],
        reverse: allTransactions[1],
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
