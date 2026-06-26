import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { Neighborhood, User } from '../administration';
import { NxFile } from '../nx_file.entity';
import { Payment } from './payment.entity';
import { TransactionCategory } from './transaction_category.entity';
import { TransactionSource } from './transaction_source.entity';
import { TransactionType } from './transaction_type.entity';

@Entity('transactions')
export class Transaction extends BaseTraceableEntity {
  @Column()
  @Exclude()
  neighborhoodId: number;

  @Column()
  @Exclude()
  typeId: number;

  @Column()
  @Exclude()
  sourceTypeId: number;

  @Column()
  @Exclude()
  evidenceId: number;

  @Column()
  @Exclude()
  reversedById: number;

  @Column()
  @Exclude()
  categoryId: number;

  @Column({ nullable: true })
  @Exclude()
  paymentId: number;

  @Column({
    type: 'int',
    default: 0,
  })
  amount: number;

  @Column({ type: 'timestamp' })
  transactionDate: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  //relationshipts
  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @ManyToOne(() => TransactionType)
  @JoinColumn({ name: 'typeId' })
  type: TransactionType;

  @ManyToOne(() => TransactionSource)
  @JoinColumn({ name: 'sourceTypeId' })
  source: TransactionSource;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @ManyToOne(() => TransactionCategory)
  @JoinColumn({ name: 'categoryId' })
  category: Payment;

  @ManyToOne(() => NxFile)
  @JoinColumn({ name: 'evidenceId' })
  evidence: NxFile;

  // ==========================================
  // Audit
  // ==========================================

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updater: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deletedBy' })
  deleter: User;
}
