import { HousingStatusEnum, HousingTypeEnum } from '@nex-house/enums';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TraceableEntity } from './_traceable.entity';
import { Neighborhood } from './neighborhood.entity';
import { UnitAssignment } from './housing-assignment.entity';

@Entity('housing_units')
export class HousingUnit extends TraceableEntity {
  @Column()
  identifier: string; // #11532, #11533, etc

  @Column()
  streetName: string;

  @Column({
    type: 'enum',
    enum: HousingStatusEnum,
    default: HousingStatusEnum.OCCUPIED,
  })
  status: HousingStatusEnum;

  @Column({
    type: 'enum',
    enum: HousingTypeEnum,
    default: HousingTypeEnum.HOUSE,
  })
  type: HousingTypeEnum;

  @Column()
  @Exclude()
  neighborhoodId: number;

  @ManyToOne(() => Neighborhood, (n) => n.units)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;

  @OneToMany(() => UnitAssignment, (assignment) => assignment.unit)
  assignments: UnitAssignment[];
}
