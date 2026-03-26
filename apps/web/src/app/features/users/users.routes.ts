import { Routes } from '@angular/router';

export enum USERS_ROUTES_ENUM {
  HOME = 'users',
  NEW = 'new',
  DETAILS = ':id',
  UPDATE = ':id/update',
}

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/users-home-page/users-home-page').then(
        (c) => c.UsersHomePage,
      ),
  },
  {
    path: USERS_ROUTES_ENUM.NEW,
    loadComponent: () =>
      import('./pages/user-form-page/user-form-page').then(
        (c) => c.UserFormPage,
      ),
  },
  {
    path: USERS_ROUTES_ENUM.DETAILS,
    loadComponent: () =>
      import('./pages/user-details-page/user-details-page').then(
        (c) => c.UserDetailsPage,
      ),
  },
  {
    path: USERS_ROUTES_ENUM.UPDATE,
    loadComponent: () =>
      import('./pages/user-form-page/user-form-page').then(
        (c) => c.UserFormPage,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
