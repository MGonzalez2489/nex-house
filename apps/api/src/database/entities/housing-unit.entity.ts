import { HousingStatusEnum, HousingTypeEnum } from '@nex-house/enums';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './_base.entity';
import { Neighborhood } from './neighborhood.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class HousingUnit extends BaseEntity {
  @Column()
  identifier: string; // #11532, #11533, etc

  @Column()
  streetName: string;

  @Column({
    type: 'enum',
    enum: HousingStatusEnum,
    default: HousingStatusEnum.OCCUPIED,
  })
  status: HousingStatusEnum;

  @Column({
    type: 'enum',
    enum: HousingTypeEnum,
    default: HousingTypeEnum.HOUSE,
  })
  type: HousingTypeEnum;

  @Column()
  neighborhoodId: string;

  @Column({ nullable: true })
  @Exclude()
  ownerId: string;

  @Column({ nullable: true })
  @Exclude()
  occupantId: string;

  @ManyToOne(() => Neighborhood, (n) => n.units)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'occupantId' })
  occupant: User;
}
