import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from './_base';
import { Exclude } from 'class-transformer';
import { User } from './administration';

@Entity('sessions')
export class NxSession extends BaseEntity {
  @Index()
  @Exclude()
  @Column({ nullable: false })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text' })
  refreshTokenHash: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'socketid',
  })
  socketId: string | null;

  @Column({ nullable: true })
  browser: string; // Ej: Chrome

  @Column({ nullable: true })
  browserVersion: string;

  @Column({ nullable: true })
  os: string; // Ej: macOS

  @Column({ nullable: true })
  device: string; // Ej: iPhone, Macintosh

  @Column({ nullable: true })
  ipAddress: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamp' })
  lastActivity: Date;
}
