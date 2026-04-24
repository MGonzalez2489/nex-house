import { Column, Entity, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';
import { TransactionTypeEnum } from '@nex-house/enums';
import { BaseEntity } from './_base.entity';

@Entity('transaction_categories')
export class TransactionCategory extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  icon: string;

  @Column({ length: 7, default: '#64748b' })
  color: string;

  @Column({
    type: 'enum',
    enum: TransactionTypeEnum,
    default: TransactionTypeEnum.BOTH,
  })
  allowedType: TransactionTypeEnum;

  @OneToMany(() => Transaction, (t) => t.category)
  transactions: Transaction[];
}
