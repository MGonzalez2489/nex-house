import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './_base.entity';
import { Neighborhood } from './neighborhood.entity';
import { UserRoleEnum } from '@nex-house/enums';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.RESIDENT,
  })
  role: UserRoleEnum;

  @Column({ nullable: true })
  neighborhoodId: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;
}
