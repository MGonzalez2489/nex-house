import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { NeighStreet } from './neigh_street.entity';
import { User } from './user.entity';
import { Unit } from './unit.entity';
import { NeighAddress } from './neigh_address.entity';

@Entity('neighborhoods')
export class Neighborhood extends BaseTraceableEntity {
  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  //relationships

  @OneToOne(() => NeighAddress, (address) => address.neighborhood, {
    cascade: true,
  })
  address: NeighAddress;

  @OneToMany(() => Unit, (unit) => unit.neighborhood)
  units: Unit[];

  @OneToMany(() => NeighStreet, (street) => street.neighborhood)
  streets: NeighStreet[];

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
