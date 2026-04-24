import { Column, Entity } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';

@Entity('files')
export class NxFile extends TraceableEntity {
  @Column()
  originalName: string;

  @Column()
  fileName: string; // Nombre único en storage

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  extension: string;

  // Relación inversa con Transaction (opcional)
  // @OneToOne(() => Transaction, (t) => t.file)
  // transaction?: Transaction;
}
