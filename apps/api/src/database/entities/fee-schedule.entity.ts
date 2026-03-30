import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Exclude } from 'class-transformer';
import { Neighborhood } from './neighborhood.entity';
import { FeeScheduleStatusEnum, FeeScheduleTypeEnum } from '@nex-house/enums';
import { Charge } from './charge.entity';

@Entity('fee-schedules')
export class FeeSchedule extends TraceableEntity {
  @Column({ nullable: true })
  @Exclude()
  neighborhoodId: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'int',
    default: 0,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: FeeScheduleTypeEnum,
    default: FeeScheduleTypeEnum.ONE_TIME,
  })
  type: FeeScheduleTypeEnum;

  //TODO: REVIEW THIS
  @Column()
  cronSchedule: string; // Ej: "0 0 1 * *"

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date; // Si es null, es infinita

  @Column({
    type: 'enum',
    enum: FeeScheduleStatusEnum,
    default: FeeScheduleStatusEnum.ACTIVE,
  })
  status: FeeScheduleStatusEnum;

  //relationships
  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @OneToMany(() => Charge, (charge) => charge.feeSchedule)
  charges: Charge[];
}
