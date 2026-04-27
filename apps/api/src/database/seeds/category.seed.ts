import {
  TransactionCategoriesEnum,
  TransactionTypeEnum,
} from '@nex-house/enums';

export const INITIAL_CATEGORIES = [
  {
    name: 'Cuotas de Mantenimiento',
    icon: 'maintenance',
    color: '#10b981',
    allowedType: TransactionTypeEnum.INCOME,
  },
  {
    name: 'Servicios Públicos',
    icon: 'utilities',
    color: '#f59e0b',
    allowedType: TransactionTypeEnum.EXPENSE,
  },
  {
    name: 'Reparaciones y Mejoras',
    icon: 'repairs',
    color: '#3b82f6',
    allowedType: TransactionTypeEnum.EXPENSE,
  },
  {
    name: 'Seguridad',
    icon: 'security',
    color: '#ef4444',
    allowedType: TransactionTypeEnum.EXPENSE,
  },
  {
    name: 'Eventos y Amenidades',
    icon: 'events',
    color: '#8b5cf6',
    allowedType: TransactionTypeEnum.BOTH,
  },
  {
    name: TransactionCategoriesEnum.OTHER,
    icon: 'others',
    color: '#64748b',
    allowedType: TransactionTypeEnum.BOTH,
  },
  {
    name: TransactionCategoriesEnum.CANCELLATION,
    icon: 'cancellation',
    color: '#0891b2',
    allowedType: TransactionTypeEnum.BOTH,
  },
];
