import { BaseModel } from './_base.model';
import { UnitModel } from './unit.model';
import { UserModel } from './user.model';

export class UnitAssignmentModel extends BaseModel {
  isOwner: boolean;
  isFamily: boolean;
  isTenant: boolean;

  user?: UserModel;
  unit?: UnitModel;
}
