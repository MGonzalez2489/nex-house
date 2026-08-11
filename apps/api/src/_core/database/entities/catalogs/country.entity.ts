import { Entity, Column, OneToMany } from 'typeorm';
import { State } from './state.entity';
import { BaseEntity } from '../_base';

@Entity('countries')
export class Country extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  displayName: string;

  @Column({
    type: 'varchar',
    length: 3,
    unique: true,
    comment: 'ISO 3166-1 alpha-2 or alpha-3 code',
  })
  code: string;

  @OneToMany(() => State, (state) => state.country)
  states: State[];
}
