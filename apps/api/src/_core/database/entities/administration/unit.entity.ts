import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { NeighStreet } from './neigh_street.entity';
import { Neighborhood } from './neighborhood.entity';
import { UnitType } from './unit_type.entity';
import { UserUnit } from './user-unit.entity';
import { User } from './user.entity';
import { UnitStatus } from './unit_status.entity';

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

  @Column()
  @Exclude()
  neighborhoodId: number;

  @Column()
  @Exclude()
  statusId: number;

  //relationshipts
  @ManyToOne(() => NeighStreet)
  @JoinColumn({ name: 'streetId' })
  street: NeighStreet;

  @ManyToOne(() => UnitType)
  @JoinColumn({ name: 'typeId' })
  type: UnitType;

  @ManyToOne(() => Neighborhood, (n) => n.streets)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @OneToMany(() => UserUnit, (userUnit) => userUnit.unit)
  userUnits: UserUnit[];

  @ManyToOne(() => UnitStatus)
  @JoinColumn({ name: 'statusId' })
  status: UnitStatus;

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
