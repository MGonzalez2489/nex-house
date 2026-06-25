import { Column } from 'typeorm';
import { BaseEntity } from './_base.entity';

export abstract class BaseCatalog extends BaseEntity {
  @Column()
  displayName: string;

  @Column({ nullable: true })
  description: string;
}
