export interface UpdateUser {
  firstName?: string;
  lastName?: string;
  phone?: string;

  //unit
  unitId?: string;

  streetId?: string;
  unitTypeId?: string;
  unitIdentifier?: string;
  //roles
  userRoleId?: string;
  unitRoleId?: string;
  isCurrentOccupant?: boolean;
}
