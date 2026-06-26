import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { Exclude } from 'class-transformer';
import { NeighStreet } from './neigh_street.entity';
import { UnitType } from './unit_type.entity';
import { User } from './user.entity';

@Entity('units')
export class Unit extends BaseTraceableEntity {
  @Column()
  identifier: string; // #1236, #4456-A

  @Column()
  @Exclude()
  streetId: number;

  @Column()
  @Exclude()
  typeId: number;

  //relationshipts
  @ManyToOne(() => NeighStreet)
  @JoinColumn({ name: 'streetId' })
  street: NeighStreet;

  @ManyToOne(() => UnitType)
  @JoinColumn({ name: 'typeId' })
  type: UnitType;

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
