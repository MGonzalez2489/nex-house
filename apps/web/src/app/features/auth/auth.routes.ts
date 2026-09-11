import {Routes} from '@angular/router';
import {AuthContainer} from './auth-container';

export enum AUTH_ROUTES_ENUM {
  LOGIN = 'login',
  PASS_RECOVERY_REQUEST = 'recovery-request',
  PASS_VALIDATE_CODE = 'validate-code',
  PASS_RECOVERY = 'password-recovery',
}

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthContainer,
    children: [
      {
        path: AUTH_ROUTES_ENUM.LOGIN,
        loadComponent: () => import('./pages/login/login-page').then((c) => c.LoginPage),
      },
      {
        path: AUTH_ROUTES_ENUM.PASS_RECOVERY_REQUEST,
        loadComponent: () =>
          import('./pages/pass-recovery-request/pass-recovery-request-page').then(
            (c) => c.PassRecoveryRequestPage,
          ),
      },
      {
        path: AUTH_ROUTES_ENUM.PASS_VALIDATE_CODE,
        loadComponent: () =>
          import('./pages/pass-code-validate/pass-code-validate-page').then(
            (c) => c.PassCodeValidatePage,
          ),
      },
      {
        path: AUTH_ROUTES_ENUM.PASS_RECOVERY,
        loadComponent: () =>
          import('./pages/pass-recovery-page/pass-recovery-page').then((c) => c.PassRecoveryPage),
      },

      {path: '', redirectTo: AUTH_ROUTES_ENUM.LOGIN, pathMatch: 'full'},
    ],
  },
];
