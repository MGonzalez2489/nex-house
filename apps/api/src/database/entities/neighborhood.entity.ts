import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './_base.entity';
import { HousingUnit } from './housing-unit.entity';

@Entity()
export class Neighborhood extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  address: string;

  //TODO:
  // @Column({ type: 'json' })
  // settings: INeighborhoodSettings;
  //
  @OneToMany(() => HousingUnit, (unit) => unit.neighborhood)
  units: HousingUnit[];
}
