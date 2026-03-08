import { Exclude } from 'class-transformer/';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, update: false })
  @Generated('uuid')
  publicId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: string;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: string;
}
