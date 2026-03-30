import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Exclude } from 'class-transformer';
import { Payment } from './payment.entity';
import { Charge } from './charge.entity';

@Entity('payment-applications')
export class PaymentApplication extends TraceableEntity {
  @Column()
  @Exclude()
  paymentId: number;

  @Column()
  @Exclude()
  chargeId: number;

  @Column({
    type: 'int',
    default: 0,
  })
  amountApplied: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  appliedAt: Date;

  //relationships

  @ManyToOne(() => Payment, (payment) => payment.applications)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @ManyToOne(() => Charge, (charge) => charge.applications)
  @JoinColumn({ name: 'chargeId' })
  charge: Charge;
}
