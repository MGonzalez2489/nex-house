import { UserStatusEnum } from '@nexhouse/shared-domain/enums';

export const UserStatusSeed = [
  {
    name: UserStatusEnum.ACTIVE,
    displayName: 'Activo',
  },
  {
    name: UserStatusEnum.INACTIVE,
    displayName: 'Inactivo',
  },
  {
    name: UserStatusEnum.PENDING,
    displayName: 'Pendiente',
  },
];
