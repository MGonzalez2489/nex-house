export interface CreateUnit {
  streetId: string;
  unitTypeId: string;
  unitIdentifier: string;
  unitRoleId: string;

  //TODO: review if it needs to be
  //moved to other place
  userId?: string;
  isCurrentOccupant: boolean;
}
