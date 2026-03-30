import { Exclude } from 'class-transformer';
import { Column } from 'typeorm';
import { BaseEntity } from './_base.entity';

export abstract class TraceableEntity extends BaseEntity {
  @Column({ nullable: true })
  @Exclude()
  createdBy: number;

  @Column({ nullable: true })
  @Exclude()
  updatedBy: number;

  @Column({ nullable: true })
  @Exclude()
  deletedBy: number;
}
