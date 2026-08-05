import { Route } from "@angular/router";
import { AuthGuard } from "@auth/guards";
import { DASHBOARD_ROUTES_ENUM } from "@dashboard/index";
import { MainLayout } from "@shared/layout";
import { NEIGHBORHOOD_ROUTES_ENUM } from "./features/neighborhoods";
import { AccessGuard, onboardingRequiredGuard } from "@core/guards";
import { UserRoleEnum } from "@nexhouse/shared-domain/enums";
import { PAGES_ROUTES_ENUM, UnauthorizedPage } from "./pages";
import { RESIDENT_ROUTES_ENUM } from "./features/residents";
import { UNIT_ROUTES_ENUM } from "@units/units.routes";
import { ONBOARDING_ROUTES_ENUM } from "./features/onboarding";

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
    canActivate: [AuthGuard, onboardingRequiredGuard],
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: ONBOARDING_ROUTES_ENUM.HOME,
        canActivate: [onboardingRequiredGuard],
        loadChildren: () =>
          import("./features/onboarding/onboarding.routes").then(
            (m) => m.ONBOARDING_ROUTES,
          ),
      },
      {
        path: DASHBOARD_ROUTES_ENUM.HOME,
        loadChildren: () =>
          import("./features/dashboard/dashboard.routes").then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: NEIGHBORHOOD_ROUTES_ENUM.HOME,
        canActivate: [AccessGuard([UserRoleEnum.SUPERADMIN])],
        loadChildren: () =>
          import("./features/neighborhoods/neighborhood.routes").then(
            (m) => m.NEIGHBORHOOD_ROUTES,
          ),
      },
      {
        path: RESIDENT_ROUTES_ENUM.HOME,
        canActivate: [AccessGuard([UserRoleEnum.ADMIN])],
        loadChildren: () =>
          import("./features/residents/resident.routes").then(
            (m) => m.RESIDENT_ROUTES,
          ),
      },
      {
        path: UNIT_ROUTES_ENUM.HOME,
        canActivate: [AccessGuard([UserRoleEnum.ADMIN])],
        loadChildren: () =>
          import("./features/units/units.routes").then((m) => m.UNIT_ROUTES),
      },
    ],
  },
  { path: PAGES_ROUTES_ENUM.UNAUTHORIZED, component: UnauthorizedPage },
  {
    path: "**",
    redirectTo: "/auth/login",
  },
];
