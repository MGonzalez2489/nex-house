import { Routes } from '@angular/router';

export enum FINANCE_ROUTES_ENUM {
  HOME = 'finance',
}

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/finance-home/finance-home').then((c) => c.FinanceHome),
  },
];
