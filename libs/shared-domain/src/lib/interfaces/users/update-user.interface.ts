import { CreateUnit } from '../units';

export interface UpdateUser {
  //roles
  userRoleId?: string;

  //unit
  unit?: CreateUnit;
}
