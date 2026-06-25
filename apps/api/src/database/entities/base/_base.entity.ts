import { Exclude } from 'class-transformer/';
import { Column, Generated, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, update: false })
  @Generated('uuid')
  publicId: string;
}
