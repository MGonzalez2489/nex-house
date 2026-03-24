import { Routes } from '@angular/router';
import { UNITS_ROUTES_ENUM } from '@features/housing-unit';
import { USERS_ROUTES_ENUM } from '@features/users';

export enum NEIGHBORHOODS_ROUTES_ENUM {
  HOME = 'neighborhoods',
  DETAILS = ':id',
  OVERVIEW = 'overview',
}

export const NEIGHBORHOODS_ROUTES: Routes = [
  {
    path: '',
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
        path: NEIGHBORHOODS_ROUTES_ENUM.OVERVIEW,
        loadComponent: () =>
          import('./pages/neig-general/neig-general-page').then(
            (c) => c.NeigGeneralPage,
          ),
      },
      {
        path: USERS_ROUTES_ENUM.HOME,
        loadChildren: () =>
          import('@features/users/users.routes').then((c) => c.USERS_ROUTES),
      },
      {
        path: UNITS_ROUTES_ENUM.HOME,
        loadChildren: () =>
          import('@features/housing-unit/housing-units.routes').then(
            (c) => c.UNITS_ROUTES,
          ),
      },
      {
        path: '**',
        redirectTo: NEIGHBORHOODS_ROUTES_ENUM.OVERVIEW,
      },
    ],
  },
];
