import { RoleModel } from './role.model';
import { UserStatusModel } from './user-status.model';

export interface UserModel {
  email: string;
  role: RoleModel;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  status: UserStatusModel;
}
