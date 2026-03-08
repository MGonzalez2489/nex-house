import { UserRole } from '@nex-house/enums';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './_base.entity';
import { Neighborhood } from './neighborhood.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Por seguridad, el password no se incluye en consultas normales
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.RESIDENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  neighborhoodId: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;
}
