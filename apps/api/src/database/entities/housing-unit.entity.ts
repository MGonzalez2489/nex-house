import { HousingStatusEnum, HousingTypeEnum } from '@nex-house/enums';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Neighborhood } from './neighborhood.entity';

@Entity()
export class HousingUnit extends TraceableEntity {
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
  @Exclude()
  neighborhoodId: number;

  // @Column({ nullable: true })
  // @Exclude()
  // ownerId: number;
  //
  // @Column({ nullable: true })
  // @Exclude()
  // occupantId: number;

  @ManyToOne(() => Neighborhood, (n) => n.units)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'ownerId' })
  // owner: User;
  //
  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'occupantId' })
  // occupant: User;
}
