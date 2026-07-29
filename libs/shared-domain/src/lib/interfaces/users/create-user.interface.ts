export interface CreateUser {
  //general
  email: string;

  //unit
  unitId?: string;

  streetId?: string;
  unitTypeId?: string;
  identifier?: string;
  //roles
  userRoleId: string;
  unitRoleId: string;
  isCurrentOccupant: boolean;
}
