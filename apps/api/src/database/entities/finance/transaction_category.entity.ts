import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseCatalog } from '../_base';
import { Exclude } from 'class-transformer';
import { Neighborhood, User } from '../administration';
import { TransactionType } from './transaction_type.entity';

@Entity()
export class TransactionCategory extends BaseCatalog {
  @Column()
  @Exclude()
  neighborhoodId: number;

  @Column()
  icon: string;

  @Column()
  color: string;

  @Column()
  @Exclude()
  forTransactionTypeId: number;

  //relationshipts
  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @ManyToOne(() => TransactionType)
  @JoinColumn({ name: 'forTransactionTypeId' })
  forTransactionType: TransactionType;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updater: User;
}
