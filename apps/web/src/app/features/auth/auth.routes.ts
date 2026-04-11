import { Routes } from '@angular/router';
import { AuthContainer } from './auth-container';

export enum AUTH_ROUTES_ENUM {
  LOGIN = 'login',
  PASS_RECOVERY = 'password-recovery',
  NEW_PASSWORD = 'new-password',
}

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthContainer,
    children: [
      {
        path: AUTH_ROUTES_ENUM.LOGIN,
        loadComponent: () => import('./pages/login/login').then((c) => c.Login),
      },
      {
        path: AUTH_ROUTES_ENUM.PASS_RECOVERY,
        loadComponent: () =>
          import('./pages/password-recovery/password-recovery').then(
            (c) => c.PasswordRecovery,
          ),
      },
      {
        path: AUTH_ROUTES_ENUM.NEW_PASSWORD,
        loadComponent: () =>
          import('./pages/new-password/new-password').then(
            (c) => c.NewPassword,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
