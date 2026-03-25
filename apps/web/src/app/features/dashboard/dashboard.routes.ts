import { Routes } from '@angular/router';

export enum DASHBOARD_ROUTES_ENUM {
  HOME = 'dashboard',
}

export const DASHBOARD_ROUTES: Routes = [
  {
    path: DASHBOARD_ROUTES_ENUM.HOME,
    loadComponent: () =>
      import('./dashboard-container').then((c) => c.DashboardContainer),
  },
];
