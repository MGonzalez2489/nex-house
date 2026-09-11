import { CreateUnit } from '../units';

export interface UpdateUser {
  //roles
  userRoleId?: string;

  //unit
  unit?: CreateUnit;

  //internal
  recoveryCode?: string;
  recoveryCodeExpiration?: string;
  recoveryToken?: string;
}
