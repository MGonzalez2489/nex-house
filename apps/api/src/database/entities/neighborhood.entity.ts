import { Column, Entity, OneToMany } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { HousingUnit } from './housing-unit.entity';
import { NeighborhoodStatusEnum } from '@nex-house/enums';

@Entity('neighborhoods')
export class Neighborhood extends TraceableEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  address: string;

  @Column({
    type: 'enum',
    enum: NeighborhoodStatusEnum,
    default: NeighborhoodStatusEnum.ACTIVE,
  })
  status: NeighborhoodStatusEnum;

  @OneToMany(() => HousingUnit, (unit) => unit.neighborhood)
  units: HousingUnit[];
}
