import { TransactionTypeEnum } from '@nexhouse/shared-domain/enums';

export const TransactionTypeSeed = [
  {
    name: TransactionTypeEnum.INCOME,
    displayName: 'Ingreso',
  },
  {
    name: TransactionTypeEnum.EXPENSE,
    displayName: 'Gasto',
  },
];
