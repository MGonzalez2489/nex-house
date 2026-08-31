import { BaseModel } from './_base.model';
import { NeighborhoodModel } from './neighborhood.model';
import { UserProfileModel } from './user-profile.model';
import { UserRoleModel } from './user-role.model';
import { UserStatusModel } from './user-status.model';
import { UserUnitModel } from './user-unit.model';

export interface UserModel extends BaseModel {
  email: string;
  isFirstAdmin: boolean;
  requirePwdChange: boolean;

  //relationships
  role?: UserRoleModel;
  profile?: UserProfileModel;
  status?: UserStatusModel;
  neighborhood?: NeighborhoodModel;
  userUnits: UserUnitModel[];
}
