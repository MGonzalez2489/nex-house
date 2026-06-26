import { ChargeStatusEnum } from '@nexhouse/shared-domain/enums';

export const ChargeStatusSeed = [
  {
    name: ChargeStatusEnum.PENDING,
    displayName: 'Pendiente',
  },
  {
    name: ChargeStatusEnum.IN_REVIEW,
    displayName: 'En revisión',
  },
  {
    name: ChargeStatusEnum.PAID,
    displayName: 'Pagado',
  },
  {
    name: ChargeStatusEnum.CANCELLED,
    displayName: 'Cancelado',
  },
];
