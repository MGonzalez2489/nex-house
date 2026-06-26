import { PaymentStatusEnum } from '@nexhouse/shared-domain/enums';

export const PaymentStatusSeed = [
  {
    name: PaymentStatusEnum.PENDING,
    displayName: 'Pendiente',
  },
  {
    name: PaymentStatusEnum.APPROVED,
    displayName: 'Aprobado',
  },
  {
    name: PaymentStatusEnum.REJECTED,
    displayName: 'Rechazado',
  },
  {
    name: PaymentStatusEnum.CANCELLED,
    displayName: 'Cancelado',
  },
];
