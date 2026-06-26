import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTraceableEntity } from '../_base';
import { Neighborhood } from './neighborhood.entity';

@Entity('neigh_streets')
export class NeighStreet extends BaseTraceableEntity {
  @Column({ type: 'text' })
  name: string;

  @Column()
  @Exclude()
  neighborhoodId: number;

  //relationships
  @ManyToOne(() => Neighborhood, (n) => n.streets)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;
}
