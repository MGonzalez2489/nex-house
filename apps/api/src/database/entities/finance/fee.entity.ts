import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { Exclude } from 'class-transformer';
import { Neighborhood, User } from '../administration';
import { FeeStatus } from './fee_status.entity';
import { FeeTypeEnum } from '@nexhouse/shared-domain/enums';

@Entity('fees')
export class Fee extends BaseTraceableEntity {
  @Column()
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
    enum: FeeTypeEnum,
    default: FeeTypeEnum.ONE_TIME,
  })
  type: FeeTypeEnum;

  @Column()
  cronSchedule: string;

  @Column()
  cronDescription: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  lastExecutionDate: Date;

  @Column()
  @Exclude()
  statusId: number;

  //relationshipts
  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @ManyToOne(() => FeeStatus)
  @JoinColumn({ name: 'statusId' })
  status: FeeStatus;

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
