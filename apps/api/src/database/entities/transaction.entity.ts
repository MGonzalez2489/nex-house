import {
  TransactionSourceTypeEnum,
  TransactionTypeEnum,
} from '@nex-house/enums';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { NxFile } from './file.entity';
import { Neighborhood } from './neighborhood.entity';
import { TransactionCategory } from './transaction_category.entity';
import { User } from './user.entity';

@Entity('transactions')
export class Transaction extends TraceableEntity {
  @Column()
  @Exclude()
  neighborhoodId: number;

  @Column({
    type: 'enum',
    enum: TransactionTypeEnum,
    default: TransactionTypeEnum.EXPENSE,
  })
  type: TransactionTypeEnum;

  @Column({
    type: 'int',
    default: 0,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionSourceTypeEnum,
    default: TransactionSourceTypeEnum.EXPENSE,
  })
  sourceType: TransactionSourceTypeEnum;

  @Column({ type: 'timestamp' })
  transactionDate: string; // Para reportes mensuales precisos

  @Column({ type: 'text' })
  title: string; // "Pago Cuota Mantenimiento - Casa A1" o "Compra Escobas"

  @Column({ nullable: true })
  evidenceId: number;

  @Column({ type: 'text', nullable: true })
  description: string; // "Pago Cuota Mantenimiento - Casa A1" o "Compra Escobas"

  @Column()
  @Exclude()
  categoryId: number;

  // --- Campos para Auditoría y Reversión ---

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  @Exclude()
  reversedById: number;

  @OneToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'reversedById' })
  reversedBy?: Transaction;

  @Column({ default: false })
  isReversal: boolean;

  //relationships
  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @ManyToOne('User')
  @JoinColumn({ name: 'createdBy' })
  createdByUser?: User;

  @ManyToOne(() => TransactionCategory, (c) => c.transactions)
  @JoinColumn({ name: 'categoryId' })
  category: TransactionCategory;

  @OneToOne(() => NxFile, { nullable: true, cascade: true })
  @JoinColumn({ name: 'evidenceId' })
  evidence?: NxFile;
}
