import { BaseModel } from './_base.model';
import { NeighStreetModel } from './neigh-street.model';
import { UnitTypeModel } from './unit-type.model';
import { UserUnitModel } from './user-unit.model';

export interface UnitModel extends BaseModel {
  identifier: string;
  type: UnitTypeModel;
  street: NeighStreetModel;

  userUnits: UserUnitModel[];
}
