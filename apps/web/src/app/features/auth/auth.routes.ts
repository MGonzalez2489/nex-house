import { Routes } from '@angular/router';
import { AuthContainer } from './auth-container';

export enum AUTH_ROUTES_ENUM {
  LOGIN = 'login',
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
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
