export interface UpdateUser {
  //unit
  unitId?: string;

  streetId?: string;
  unitTypeId?: string;
  unitIdentifier?: string;
  //roles
  userRoleId?: string;

  //TODO: move this to a separated intercae (user to unit = UserUnit)
  unitRoleId?: string;
  isCurrentOccupant?: boolean;
}
