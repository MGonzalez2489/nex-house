import { Route } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

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
        path: 'neighborhoods',
        loadChildren: () =>
          import('./features/neighborhoods/neighborhoods.routes').then(
            (m) => m.NEIGHBORHOODS_ROUTES,
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
