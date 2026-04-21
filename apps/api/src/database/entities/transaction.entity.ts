import {
  TransactionSourceTypeEnum,
  TransactionTypeEnum,
} from '@nex-house/enums';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Neighborhood } from './neighborhood.entity';

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

  @Column({ type: 'text', nullable: true })
  description: string; // "Pago Cuota Mantenimiento - Casa A1" o "Compra Escobas"

  //relationships
  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;
}
