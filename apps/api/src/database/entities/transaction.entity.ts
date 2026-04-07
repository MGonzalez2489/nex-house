import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Exclude } from 'class-transformer';
import { Neighborhood } from './neighborhood.entity';
import {
  TransactionSourceTypeEnum,
  TransactionTypeEnum,
} from '@nex-house/enums';

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

  @Column({ type: 'date' })
  transactionDate: Date; // Para reportes mensuales precisos

  @Column({ type: 'text', nullable: true })
  description: string; // "Pago Cuota Mantenimiento - Casa A1" o "Compra Escobas"

  //relationships
  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;
}
