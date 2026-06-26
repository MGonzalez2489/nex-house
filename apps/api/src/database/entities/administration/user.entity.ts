import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { Neighborhood } from './neighborhood.entity';
import { UserRole } from './user_role.entity';
import { UserStatus } from './user_status.entity';

@Entity('users')
export class User extends BaseTraceableEntity {
  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  @Exclude()
  neighborhoodId: number;

  @Column()
  @Exclude()
  roleId: number;

  @Column()
  @Exclude()
  statusId: number;

  //relationshipts
  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @ManyToOne(() => UserRole)
  @JoinColumn({ name: 'roleId' })
  role: UserRole;

  @ManyToOne(() => UserStatus)
  @JoinColumn({ name: 'statusId' })
  status: UserStatus;

  // @OneToMany(() => UnitAssignment, (assignment) => assignment.user)
  // assignments: UnitAssignment[];

  //virtual properties
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}
