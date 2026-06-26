import { TransactionSourceEnum } from '@nexhouse/shared-domain/enums';

export const TransactionSourceSeed = [
  {
    name: TransactionSourceEnum.PAYMENT,
    displayName: 'Pago',
  },
  {
    name: TransactionSourceEnum.DIRECT,
    displayName: 'Directo',
  },
];
