import { FeeStatusEnum } from '@nexhouse/shared-domain/enums';

export const FeeStatusSeed = [
  {
    name: FeeStatusEnum.ACTIVE,
    displayName: 'Activo',
  },
  {
    name: FeeStatusEnum.PAUSED,
    displayName: 'En pausa',
  },
  {
    name: FeeStatusEnum.CANCELLED,
    displayName: 'Cancelado',
  },
  {
    name: FeeStatusEnum.SCHEDULED,
    displayName: 'Agendado',
  },
  {
    name: FeeStatusEnum.COMPLETED,
    displayName: 'Completado',
  },
];
