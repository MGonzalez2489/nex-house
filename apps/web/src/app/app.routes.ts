import { Route } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { UNITS_ROUTES_ENUM } from '@features/housing-unit';
import { NEIGHBORHOODS_ROUTES_ENUM } from '@features/neighborhoods';
import { USERS_ROUTES_ENUM } from '@features/users';

export const appRoutes: Route[] = [
  //public routes
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  //private routes
  {
    path: '',
    loadComponent: () =>
      import('./_core/layout/main-layout/main-layout').then(
        (m) => m.MainLayout,
      ),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: NEIGHBORHOODS_ROUTES_ENUM.HOME,
        loadChildren: () =>
          import('./features/neighborhoods/neighborhoods.routes').then(
            (m) => m.NEIGHBORHOODS_ROUTES,
          ),
      },
      {
        path: USERS_ROUTES_ENUM.HOME,
        loadChildren: () =>
          import('./features/users/users.routes').then((r) => r.USERS_ROUTES),
      },
      {
        path: UNITS_ROUTES_ENUM.HOME,
        loadChildren: () =>
          import('./features/housing-unit/housing-units.routes').then(
            (r) => r.UNITS_ROUTES,
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
