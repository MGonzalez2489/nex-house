import { Routes } from '@angular/router';

export enum NEIGHBORHOODS_ROUTES_ENUM {
  HOME = '',
  DETAILS = ':id',
}

export const NEIGHBORHOODS_ROUTES: Routes = [
  {
    path: NEIGHBORHOODS_ROUTES_ENUM.HOME,
    loadComponent: () =>
      import('./neighborhoods-container').then((c) => c.NeighborhoodsContainer),
    children: [
      {
        path: NEIGHBORHOODS_ROUTES_ENUM.HOME,
        loadComponent: () =>
          import('./pages/neighborhood-home/neighborhood-home-page').then(
            (c) => c.NeighborhoodHomePage,
          ),
      },
      {
        path: NEIGHBORHOODS_ROUTES_ENUM.DETAILS,
        loadComponent: () =>
          import('./pages/neighborhood-details/neighborhood-details-page').then(
            (c) => c.NeighborhoodDetailsPage,
          ),
        children: [
          {
            path: 'general',
            loadComponent: () =>
              import('./pages/neig-general/neig-general-page').then(
                (c) => c.NeigGeneralPage,
              ),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./pages/neig-users/neig-users-page').then(
                (c) => c.NeigUsersPage,
              ),
          },
          {
            path: 'users/new',
            loadComponent: () =>
              import('./pages/users/user-form-page/user-form-page').then(
                (c) => c.UserFormPage,
              ),
          },
          {
            path: 'users/:id/update',
            loadComponent: () =>
              import('./pages/users/user-form-page/user-form-page').then(
                (c) => c.UserFormPage,
              ),
          },
          {
            path: 'units',
            loadComponent: () =>
              import('./pages/neig-units/neig-units-page').then(
                (c) => c.NeigUnitsPage,
              ),
          },
          {
            path: '',
            redirectTo: 'general',
            pathMatch: 'full',
          },
        ],
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
