import { Exclude } from 'class-transformer';
import { PrimaryGeneratedColumn, Column, Generated } from 'typeorm';

export abstract class BaseCatalog {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, update: false })
  @Generated('uuid')
  publicId: string;

  @Column({ update: false, unique: true })
  name: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  description: string;
}
