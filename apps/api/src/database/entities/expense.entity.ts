import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Exclude } from 'class-transformer';
import { Neighborhood } from './neighborhood.entity';
import { ExpenseCategoryEnum } from '@nex-house/enums';

@Entity('expenses')
export class Expense extends TraceableEntity {
  @Column({ nullable: true })
  @Exclude()
  neighborhoodId: number;

  @Column()
  description: string;

  @Column({
    type: 'int',
    default: 0,
  })
  amount: number;

  @Column({ nullable: true })
  evidenceUrl: string;

  @Column({
    type: 'enum',
    enum: ExpenseCategoryEnum,
    default: ExpenseCategoryEnum.OTHER,
  })
  category: ExpenseCategoryEnum;

  @Column({ type: 'date' })
  expenseDate: Date; // Cuándo se hizo el gasto realmente

  @Column({ nullable: true })
  providerName: string; // A quién se le pagó (ej. "CFE", "Don Juan Jardinero")

  //relationships
  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;
}
