import { DebtStatusEnum, PaymentStatusEnum } from '@nex-house/enums';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { HousingUnit } from './housing-unit.entity';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './_base.entity';

@Entity()
export class ResidentDebt extends BaseEntity {
  @Column()
  unitId: string;

  @Column()
  @Exclude()
  conceptId: string;

  @Column()
  amount: number;

  @Column()
  description: string; // Ej: "Mantenimiento Marzo 2026"

  @Column({
    type: 'enum',
    enum: DebtStatusEnum,
    default: DebtStatusEnum.NEW,
  })
  status: PaymentStatusEnum;

  @Column()
  dueDate: Date;

  @ManyToOne(() => HousingUnit)
  @JoinColumn({ name: 'unitId' })
  unit: HousingUnit;
}
