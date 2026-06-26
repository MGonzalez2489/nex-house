import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { NeighStreet } from './neigh_street.entity';
import { User } from './user.entity';

@Entity('neighborhoods')
export class Neighborhood extends BaseTraceableEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  //relationships
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
