import { CreateUnit } from '../units';

export interface CreateUser {
  //general
  email: string;
  userRoleId: string;

  //unit
  unitId?: string;

  //roles
  unit?: CreateUnit;
}
