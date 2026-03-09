import { PaymentMethodEnum, PaymentStatusEnum } from '@nex-house/enums';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './_base.entity';
import { HousingUnit } from './housing-unit.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class ResidentPayment extends BaseEntity {
  @Column()
  neighborhoodId: string;

  @Column()
  @Exclude()
  unitId: string;

  @Column()
  @Exclude()
  userId: string; // El usuario que realizó/reportó el pago

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  conceptName: string; // Guardamos el nombre del concepto por si el catálogo cambia después

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  status: PaymentStatusEnum;

  @Column({ type: 'enum', enum: PaymentMethodEnum })
  method: PaymentMethodEnum;

  @Column({ nullable: true })
  evidenceUrl: string; // URL de la foto del comprobante en S3/Cloudinary

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date; // Cuándo el admin dio el visto bueno

  @ManyToOne(() => HousingUnit)
  @JoinColumn({ name: 'unitId' })
  unit: HousingUnit;
}
