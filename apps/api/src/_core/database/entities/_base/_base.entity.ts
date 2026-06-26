import { Exclude } from 'class-transformer/';
import { Column, Generated, Index, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ nullable: false, update: false })
  @Generated('uuid')
  publicId: string;
}
