import { Route } from "@angular/router";
import { AuthGuard } from "@auth/guards";
import { DASHBOARD_ROUTES_ENUM } from "@dashboard/index";
import { MainLayout } from "@shared/layout";

export const appRoutes: Route[] = [
  //public routes
  {
    path: "auth",
    loadChildren: () =>
      import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  //private routes
  {
    path: "",
    component: MainLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: DASHBOARD_ROUTES_ENUM.HOME,
        loadChildren: () =>
          import("./features/dashboard/dashboard.routes").then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "/auth/login",
  },
];
