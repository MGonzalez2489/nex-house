import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';
import { Unit } from './unit.entity';
import { UserUnitRole } from './user_unit_role.entity';

@Entity('user_unit')
export class UserUnit extends BaseTraceableEntity {
  @Column()
  @Exclude()
  userId: number;

  @Column()
  @Exclude()
  unitId: number;

  @Column()
  @Exclude()
  userUnitRoleId: number;

  @Column({ default: true })
  isCurrentOccupant: boolean;

  //relationshipts
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @ManyToOne(() => UserUnitRole)
  @JoinColumn({ name: 'userUnitRoleId' })
  userUnitRole: UserUnitRole;

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
