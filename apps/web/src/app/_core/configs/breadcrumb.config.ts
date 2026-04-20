import { FINANCE_ROUTES_ENUM } from '@features/finance';
import { UNITS_ROUTES_ENUM } from '@features/housing-unit';
import { USERS_ROUTES_ENUM } from '@features/users';

export const BREADCRUMB_MAP: Record<string, string> = {
  // Global & Dashboard
  dashboard: 'Panel Principal',
  neighborhoods: 'Fraccionamientos',

  // [NEIGHBORHOODS_ROUTES_ENUM.HOME]: 'Fraccionamientos',

  // Finanzas (Usando el enum para evitar errores de typo)
  [FINANCE_ROUTES_ENUM.HOME]: 'Finanzas',
  [FINANCE_ROUTES_ENUM.CASH_CONTROL]: 'Control Financiero',
  [FINANCE_ROUTES_ENUM.PAYMENT_PLANS]: 'Planes de Cobro',
  [FINANCE_ROUTES_ENUM.PAYMENT_MONITOR]: 'Monitor de Cobranza',
  'finance-general': 'General',

  // Usuarios
  [USERS_ROUTES_ENUM.HOME]: 'Usuarios',
  [USERS_ROUTES_ENUM.NEW]: 'Nuevo Usuario',
  update: 'Editar',

  //Units
  [UNITS_ROUTES_ENUM.HOME]: 'Unidades',
};
