import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { Unit, User } from '../administration';
import { Exclude } from 'class-transformer';
import { Fee } from './fee.entity';
import { ChargeStatus } from './charge_status.entity';

@Entity('charges')
export class Charge extends BaseTraceableEntity {
  @Column()
  @Exclude()
  feedId: number;

  @Column()
  @Exclude()
  unitId: number;

  @Column({
    type: 'int',
    default: 0,
  })
  amount: number;

  @Column()
  @Exclude()
  statusId: number;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  cancelationReason: string;

  @Column({ nullable: true })
  @Exclude()
  canceledById: number;

  //relationships
  @ManyToOne(() => Fee)
  @JoinColumn({ name: 'feeId' })
  fee: Fee;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'canceledById' })
  canceledBy: User;

  @ManyToOne(() => ChargeStatus)
  @JoinColumn({ name: 'statusId' })
  status: ChargeStatus;

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
