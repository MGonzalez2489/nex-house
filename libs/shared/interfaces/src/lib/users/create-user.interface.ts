export class ICreateUser {
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;

  unitId?: string;
  streetName?: string;
  identifier?: string;

  isAdmin: boolean;
  isOwner: boolean;
  isFamily: boolean;
  isTenant: boolean;
}
