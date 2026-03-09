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

  // @ManyToOne('User', { nullable: true })
  // @JoinColumn({ name: 'created_by' })
  // createdBy: any;
  //
  // @ManyToOne('User', { nullable: true })
  // @JoinColumn({ name: 'updated_by' })
  // updatedBy: any;
  //
  // @ManyToOne('User', { nullable: true })
  // @JoinColumn({ name: 'deleted_by' })
  // deletedBy: any;
}
