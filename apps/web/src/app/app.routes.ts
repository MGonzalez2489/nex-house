import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  // Rutas Públicas (Auth)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  //
  // Rutas Protegidas (Dentro del Layout)
  {
    path: '',
    loadComponent: () =>
      import('./_core/layout/main-layout/main-layout').then(
        (m) => m.MainLayout,
      ),
    // canActivate: [authGuard],
    children: [
      // {
      //   path: 'dashboard',
      //   loadComponent: () =>
      //     import('./features/dashboard/dashboard.component').then(
      //       (m) => m.DashboardComponent,
      //     ),
      // },
      // {
      //   path: 'neighborhoods',
      //   loadChildren: () =>
      //     import('./features/neighborhoods/neighborhoods.routes').then(
      //       (m) => m.NEIGHBORHOOD_ROUTES,
      //     ),
      // },
      // {
      //   path: 'units',
      //   loadChildren: () =>
      //     import('./features/housing-units/units.routes').then(
      //       (m) => m.UNIT_ROUTES,
      //     ),
      // },
      // {
      //   path: 'users',
      //   loadChildren: () =>
      //     import('./features/users/users.routes').then((m) => m.USER_ROUTES),
      // },
      // {
      //   path: '',
      //   redirectTo: 'dashboard',
      //   pathMatch: 'full',
      // },
    ],
  },

  // Fallback (404 o redirección)
  {
    path: '**',
    redirectTo: 'auth/login',
  },

  // {
  //   path: '',
  //   component: MainLayout,
  // },
];
