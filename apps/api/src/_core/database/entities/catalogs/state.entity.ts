import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { City } from './city.entity';
import { Country } from './country.entity';
import { BaseEntity } from '../_base';

@Entity('states')
export class State extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  displayName: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  code: string;

  @Column()
  countryId: number;

  @ManyToOne(() => Country, (country) => country.states, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @OneToMany(() => City, (city) => city.state)
  cities: City[];
}
