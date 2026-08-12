import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { City } from '../catalogs';
import { Exclude } from 'class-transformer';
import { Neighborhood } from './neighborhood.entity';

@Entity('neigh_address')
export class NeighAddress extends BaseTraceableEntity {
  @Column({ name: 'zip_code', type: 'varchar', length: 10, nullable: true })
  zipCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column()
  @Exclude()
  cityId: number;

  @Column()
  @Exclude()
  neighborhoodId: number;

  //relationships
  @ManyToOne(() => Neighborhood, (n) => n.streets)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @ManyToOne(() => City, (city) => city.addresses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cityId' })
  city: City;
}
