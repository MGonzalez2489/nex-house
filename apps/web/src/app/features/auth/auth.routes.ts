import { Routes } from '@angular/router';
import { AuthContainer } from './auth-container';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthContainer,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((c) => c.Login),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
