import { ManyToOne, Column, Entity, JoinColumn } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { HousingUnit } from './housing-unit.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class UnitAssignment extends TraceableEntity {
  @ManyToOne(() => HousingUnit)
  @JoinColumn({ name: 'unitId' })
  unit: HousingUnit;

  @Column()
  @Exclude()
  unitId: number;

  @Column()
  @Exclude()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isOwner: boolean;

  @Column({ default: true })
  isTenant: boolean;

  @Column({ default: true })
  isFamily: boolean;
}
