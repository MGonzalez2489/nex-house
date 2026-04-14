import { APP_CONSTANTS } from '@core/constants';
import { PrimeIcons } from 'primeng/api';
import { SidebarConfigModel } from './nav.model';
import { DASHBOARD_ROUTES_ENUM } from '@features/dashboard';
import { FINANCE_ROUTES_ENUM } from '@features/finance';

// SVG path data (el contenido interno del <svg>, sin el tag raíz)

export const SIDEBAR_CONFIG: SidebarConfigModel = {
  header: {
    icon: APP_CONSTANTS.app.logo,
    name: APP_CONSTANTS.app.name,
    tagline: APP_CONSTANTS.app.tagline,
  },
  sections: [
    {
      // Sin label de sección
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: PrimeIcons.HOME,
          route: `/${DASHBOARD_ROUTES_ENUM.HOME}`,
        },
        {
          id: 'analytics',
          label: 'Analíticas',
          icon: PrimeIcons.CHART_LINE,
          route: '/analytics',
          badgeVariant: 'primary',
          isDisabled: true,
        },
      ],
    },
    {
      label: 'Gestión',
      items: [
        {
          id: FINANCE_ROUTES_ENUM.HOME,
          label: 'Finanzas',
          icon: PrimeIcons.WALLET,
          children: [
            {
              id: 'finance-general',
              label: 'General',
              route: `/${FINANCE_ROUTES_ENUM.HOME}`,
            },
            {
              id: FINANCE_ROUTES_ENUM.PAYMENT_PLANS,
              label: 'Planes de Cobro',
              route: `${FINANCE_ROUTES_ENUM.HOME}/${FINANCE_ROUTES_ENUM.PAYMENT_PLANS}`,
            },
            {
              id: FINANCE_ROUTES_ENUM.PAYMENT_MONITOR,
              label: 'Monitor de Cobranza',
              route: `${FINANCE_ROUTES_ENUM.HOME}/${FINANCE_ROUTES_ENUM.PAYMENT_MONITOR}`,
            },
          ],
        },
        {
          id: 'tasks',
          label: 'Tareas',
          icon: PrimeIcons.TAGS,
          badge: 5,
          isDisabled: true,
          badgeVariant: 'accent',
          children: [
            { id: 'tasks-mine', label: 'Mis tareas', route: '/tasks/mine' },
            {
              id: 'tasks-assigned',
              label: 'Asignadas',
              route: '/tasks/assigned',
            },
            { id: 'tasks-done', label: 'Completadas', route: '/tasks/done' },
          ],
        },
        {
          id: 'reports',
          isDisabled: true,
          label: 'Reportes',
          icon: PrimeIcons.FILE,
          route: '/reports',
        },
      ],
    },
    {
      label: 'Configuración',
      items: [
        {
          id: 'team',
          label: 'Equipo',
          icon: PrimeIcons.USERS,
          isDisabled: true,
          children: [
            { id: 'team-members', label: 'Miembros', route: '/team/members' },
            {
              id: 'team-roles',
              label: 'Roles y permisos',
              route: '/team/roles',
            },
            {
              id: 'team-invitations',
              label: 'Invitaciones',
              route: '/team/invitations',
            },
          ],
        },
        {
          id: 'preferences',
          label: 'Preferencias',
          icon: PrimeIcons.COG,
          isDisabled: true,
          route: '/settings/preferences',
        },
      ],
    },
  ],
};
