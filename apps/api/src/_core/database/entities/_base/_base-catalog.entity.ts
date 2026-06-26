import { Column } from 'typeorm';
import { BaseEntity } from './_base.entity';

export abstract class BaseCatalog extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  displayName: string;
}
