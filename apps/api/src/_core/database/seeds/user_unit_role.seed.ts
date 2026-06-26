import { UserUnitRoleEnum } from '@nexhouse/shared-domain/enums';

export const UserUnitRoleSeed = [
  {
    name: UserUnitRoleEnum.OWNER,
    displayName: 'Propietario',
  },
  {
    name: UserUnitRoleEnum.FAMILY,
    displayName: 'Familiar',
  },
  {
    name: UserUnitRoleEnum.TENANT,
    displayName: 'Inquilino',
  },
];
