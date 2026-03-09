import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './_base.entity';

@Entity()
export class PaymentConcept extends BaseEntity {
  //ej: mantenimiento mensual
  @Column({ unique: true })
  name: string;

  @Column()
  @Exclude()
  neighborhoodId: string;

  @Column()
  defaultAmount: number;

  @Column()
  isActive: boolean;

  //recurrence

  @Column()
  dayOfMonth: number;

  @Column()
  isRecurrent: boolean;

  @Column({ nullable: true })
  maxOccurrences: number;
}
