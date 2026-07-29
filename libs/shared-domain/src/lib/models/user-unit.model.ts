import { BaseCatalogModel } from './_base-catalog.model';
import { BaseModel } from './_base.model';
import { UnitModel } from './unit.model';

export interface UserUnitModel extends BaseModel {
  isCurrentOccupant: boolean;
  userUnitRole: BaseCatalogModel; //should be model
  unit: UnitModel;
}
