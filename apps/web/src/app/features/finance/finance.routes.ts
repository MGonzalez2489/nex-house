import { Routes } from '@angular/router';

export enum FINANCE_ROUTES_ENUM {
  HOME = 'finance',
  CASH_CONTROL = 'cash-control',
  PAYMENT_PLANS = 'payment-plans',
  PAYMENT_MONITOR = 'payment-monitor',
}

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/finance-home/finance-home').then((c) => c.FinanceHome),
  },
  {
    path: FINANCE_ROUTES_ENUM.CASH_CONTROL,
    loadComponent: () =>
      import('./pages/cash-control/cash-control').then((c) => c.CashControl),
  },
  {
    path: FINANCE_ROUTES_ENUM.PAYMENT_MONITOR,
    loadComponent: () =>
      import('./pages/payments-monitor/payments-monitor').then(
        (c) => c.PaymentsMonitor,
      ),
  },
  {
    path: FINANCE_ROUTES_ENUM.PAYMENT_PLANS,
    loadComponent: () =>
      import('./pages/payments-plan/payments-plan').then((c) => c.PaymentsPlan),
  },
];
