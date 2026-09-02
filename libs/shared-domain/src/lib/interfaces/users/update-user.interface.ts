export interface UpdateUser {
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
