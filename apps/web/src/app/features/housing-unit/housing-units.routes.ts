import { Routes } from '@angular/router';

export enum UNITS_ROUTES_ENUM {
  HOME = 'units',
  NEW = 'new',
  UPDATE = ':id/update',
}

export const UNITS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/units-home-page/units-home-page').then(
        (c) => c.UnitsHomePage,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
