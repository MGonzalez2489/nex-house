import { UserRoleEnum, UserStatusEnum } from '@nex-house/enums';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Neighborhood } from './neighborhood.entity';
import { UnitAssignment } from './housing-assignment.entity';

@Entity('users')
export class User extends TraceableEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.RESIDENT,
  })
  role: UserRoleEnum;

  @Column({ nullable: true })
  @Exclude()
  neighborhoodId: number;

  @Column({
    type: 'enum',
    enum: UserStatusEnum,
    default: UserStatusEnum.PENDING_COMPLETION,
  })
  status: UserStatusEnum;

  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @OneToMany(() => UnitAssignment, (assignment) => assignment.user)
  assignments: UnitAssignment[];
}
