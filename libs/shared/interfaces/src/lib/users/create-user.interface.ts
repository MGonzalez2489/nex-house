export class ICreateUser {
  email: string;
  firstName: string;
  unitId?: string;
  streetName?: string;
  identifier?: string;

  isAdmin: boolean;
  isOwner: boolean;
  isFamily: boolean;
  isTenant: boolean;
}
