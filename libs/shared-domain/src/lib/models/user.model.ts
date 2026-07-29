import { BaseModel } from './_base.model';
import { NeighborhoodModel } from './neighborhood.model';
import { UserRoleModel } from './user-role.model';
import { UserStatusModel } from './user-status.model';

export interface UserModel extends BaseModel {
  email: string;
  role: UserRoleModel;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  status: UserStatusModel;
  neighborhood: NeighborhoodModel;
}
