import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { Exclude } from 'class-transformer';
import { User } from '../administration';
import { Charge } from './charge.entity';
import { PaymentStatus } from './payment_status.entity';
import { NxFile } from '../nx_file.entity';

@Entity('payments')
export class Payment extends BaseTraceableEntity {
  @Column()
  @Exclude()
  chargeId: number;

  @Column({
    type: 'int',
    default: 0,
  })
  amount: number;

  @Column()
  @Exclude()
  evidenceId: number;

  @Column()
  @Exclude()
  statusId: number;

  @Column({ type: 'timestamp' })
  paymentDate: Date;

  @Column()
  @Exclude()
  reportedById: number;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  //relationships
  @ManyToOne(() => Charge)
  @JoinColumn({ name: 'chargeId' })
  charge: Charge;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reportedById' })
  reportedBy: User;

  @ManyToOne(() => PaymentStatus)
  @JoinColumn({ name: 'statusId' })
  status: PaymentStatus;

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
