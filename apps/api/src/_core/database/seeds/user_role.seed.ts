import { UserRoleEnum } from '@nexhouse/shared-domain/enums';

export const UserRoleSeed = [
  {
    name: UserRoleEnum.SUPERADMIN,
    displayName: 'SuperAdmin',
  },
  {
    name: UserRoleEnum.ADMIN,
    displayName: 'Administrador',
  },
  {
    name: UserRoleEnum.RESIDENT,
    displayName: 'Residente',
  },
];
