import { UserRoleEnum } from '@nex-house/enums';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Neighborhood } from './neighborhood.entity';

@Entity('users')
export class User extends TraceableEntity {
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
  @Exclude()
  neighborhoodId: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;
}
