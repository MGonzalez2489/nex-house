import { NeighborhoodModel } from './neighborhood.model';
import { UserRoleModel } from './user-role.model';
import { UserStatusModel } from './user-status.model';

export interface UserModel {
  email: string;
  role: UserRoleModel;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  status: UserStatusModel;
  neighborhood: NeighborhoodModel;
}
