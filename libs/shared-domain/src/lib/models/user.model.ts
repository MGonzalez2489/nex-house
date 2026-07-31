import { BaseModel } from './_base.model';
import { NeighborhoodModel } from './neighborhood.model';
import { UserRoleModel } from './user-role.model';
import { UserStatusModel } from './user-status.model';
import { UserUnitModel } from './user-unit.model';

export interface UserModel extends BaseModel {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;

  //relationships
  role: UserRoleModel;
  status: UserStatusModel;
  neighborhood: NeighborhoodModel;
  userUnits: UserUnitModel[];
}
