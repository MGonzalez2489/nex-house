import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Exclude } from 'class-transformer';
import { HousingUnit } from './housing-unit.entity';
import { PaymentStatusEnum } from '@nex-house/enums';
import { PaymentApplication } from './payment-application.entity';
import { User } from './user.entity';

@Entity('payments')
export class Payment extends TraceableEntity {
  @Column()
  @Exclude()
  unitId: number;

  @Column({
    type: 'int',
    default: 0,
  })
  amount: number;

  @Column({ nullable: true })
  evidenceUrl: string;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  status: PaymentStatusEnum;

  // @Column()
  // @Exclude()
  // validatedByUserId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date; // La fecha real de la transferencia

  @Column()
  @Exclude()
  reportedByUserId: number; // Quién subió el pago

  @Column({ type: 'text', nullable: true })
  adminNotes: string; // Por qué se rechazó o notas de la validación

  //relationships
  @ManyToOne(() => HousingUnit)
  @JoinColumn({ name: 'unitId' })
  unit: HousingUnit;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'validatedByUserId' })
  // validatedByUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reportedByUserId' })
  reportedByUser: User;

  @OneToMany(() => PaymentApplication, (app) => app.payment)
  applications: PaymentApplication[];
}
