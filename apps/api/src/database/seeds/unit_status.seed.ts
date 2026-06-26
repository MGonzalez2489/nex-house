import { UnitStatusEnum } from '@nexhouse/shared-domain/enums';

export const UnitStatusSeed = [
  {
    name: UnitStatusEnum.OCCUPIED,
    displayName: 'Ocupado',
  },
  {
    name: UnitStatusEnum.VACANT,
    displayName: 'Sin habitar',
  },
  {
    name: UnitStatusEnum.RENTED,
    displayName: 'En renta',
  },
];
