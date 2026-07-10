import { Route } from "@angular/router";

export const appRoutes: Route[] = [
  //public routes
  {
    path: "auth",
    loadChildren: () =>
      import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  {
    path: "**",
    redirectTo: "/auth/login",
  },
];
