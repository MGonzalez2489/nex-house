import { Entity, Column } from 'typeorm';
import { BaseTraceableEntity } from './_base';

@Entity('files')
export class NxFile extends BaseTraceableEntity {
  @Column()
  originalName: string;

  @Column()
  fileName: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  extension: string;
}
