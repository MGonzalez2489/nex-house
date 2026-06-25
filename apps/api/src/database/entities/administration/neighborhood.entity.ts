import { Column, Entity } from 'typeorm';
import { BaseTraceableEntity } from '../_base';

@Entity('neighborhoods')
export class Neighborhood extends BaseTraceableEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  address: string;

  // @Column({
  //   type: 'enum',
  //   enum: NeighborhoodStatusEnum,
  //   default: NeighborhoodStatusEnum.ACTIVE,
  // })
  // status: NeighborhoodStatusEnum;
  //
  // @OneToMany(() => HousingUnit, (unit) => unit.neighborhood)
  // units: HousingUnit[];
}
