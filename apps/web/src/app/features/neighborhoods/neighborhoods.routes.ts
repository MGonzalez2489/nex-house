import { Routes } from '@angular/router';

export const NEIGHBORHOODS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./neighborhoods-container').then((c) => c.NeighborhoodsContainer),
    children: [{ path: '', redirectTo: 'login', pathMatch: 'full' }],
  },
];
