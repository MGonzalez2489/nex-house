import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';
import { BaseEntity } from './_base.entity';

export abstract class BaseTraceableEntity extends BaseEntity {
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: string;

  @Column({ nullable: true })
  @Exclude()
  createdBy: number;

  @Column({ nullable: true })
  @Exclude()
  updatedBy: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: string;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: string;

  @Column({ nullable: true })
  @Exclude()
  deletedBy: number;
}
