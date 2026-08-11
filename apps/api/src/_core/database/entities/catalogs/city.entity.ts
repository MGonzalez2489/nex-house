import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { State } from './state.entity';
import { NeighAddress } from '../administration';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../_base';

@Entity('cities')
export class City extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  displayName: string;

  @Column()
  @Exclude()
  stateId: number;

  @ManyToOne(() => State, (state) => state.cities, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'stateId' })
  state: State;

  @OneToMany(() => NeighAddress, (address) => address.city)
  addresses: NeighAddress[];
}
