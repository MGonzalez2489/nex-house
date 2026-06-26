import { Column, Entity } from 'typeorm';
import { BaseTraceableEntity } from '../_base';

@Entity('neighborhoods')
export class Neighborhood extends BaseTraceableEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ default: false })
  isActive: boolean;

  //
  // @OneToMany(() => HousingUnit, (unit) => unit.neighborhood)
  // units: HousingUnit[];
}
