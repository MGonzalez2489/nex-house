import { FINANCE_ROUTES_ENUM } from '@features/finance';
import { USERS_ROUTES_ENUM } from '@features/users';

export const BREADCRUMB_MAP: Record<string, string> = {
  // finance: 'Finanzas',
  // 'payment-plans': 'Planes de Cobro',
  // 'payment-monitor': 'Monitor de Cobranza',
  // users: 'Usuarios',
  // neighborhoods: 'Fraccionamientos',
  // dashboard: 'Panel Principal',
  // Aquí irán mapeados tus Enums

  // Global & Dashboard
  dashboard: 'Panel Principal',
  neighborhoods: 'Fraccionamientos',

  // Finanzas (Usando el enum para evitar errores de typo)
  [FINANCE_ROUTES_ENUM.HOME]: 'Finanzas',
  [FINANCE_ROUTES_ENUM.PAYMENT_PLANS]: 'Planes de Cobro',
  [FINANCE_ROUTES_ENUM.PAYMENT_MONITOR]: 'Monitor de Cobranza',
  'finance-general': 'General',

  // Usuarios
  [USERS_ROUTES_ENUM.HOME]: 'Usuarios',
  [USERS_ROUTES_ENUM.NEW]: 'Nuevo Usuario',
  update: 'Editar',
};
