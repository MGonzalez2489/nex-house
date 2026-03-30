import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Exclude } from 'class-transformer';
import { HousingUnit } from './housing-unit.entity';
import { ChargeStatusEnum } from '@nex-house/enums';
import { FeeSchedule } from './fee-schedule.entity';
import { PaymentApplication } from './payment-application.entity';
import { User } from './user.entity';

@Entity('charges')
export class Charge extends TraceableEntity {
  @Column()
  @Exclude()
  unitId: number;

  @Column({ nullable: true })
  @Exclude()
  feeScheduleId: number;

  @Column()
  @Exclude()
  issuedToUserId: number;

  @Column()
  description: string;

  @Column({
    type: 'int',
    default: 0,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: ChargeStatusEnum,
    default: ChargeStatusEnum.PENDING,
  })
  status: ChargeStatusEnum;

  @Column()
  dueDate: string;

  //relationships
  @ManyToOne(() => HousingUnit)
  @JoinColumn({ name: 'unitId' })
  unit: HousingUnit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'issuedToUserId' })
  issuedToUser: User;

  @ManyToOne(() => FeeSchedule, (feeSchedule) => feeSchedule.charges)
  @JoinColumn({ name: 'feeScheduleId' })
  feeSchedule: FeeSchedule;

  @OneToMany(() => PaymentApplication, (app) => app.charge)
  applications: PaymentApplication[];
}
