import { Routes } from "@angular/router";
import { AuthContainer } from "./auth-container";

export enum AUTH_ROUTES_ENUM {
  LOGIN = "login",
  PASS_RECOVERY = "password-recovery",
}

export const AUTH_ROUTES: Routes = [
  {
    path: "",
    component: AuthContainer,
    children: [
      {
        path: AUTH_ROUTES_ENUM.LOGIN,
        loadComponent: () =>
          import("./pages/login/login-page").then((c) => c.LoginPage),
      },
      {
        path: AUTH_ROUTES_ENUM.PASS_RECOVERY,
        loadComponent: () =>
          import("./pages/pass-recovery-page/pass-recovery-page").then(
            (c) => c.PassRecoveryPage,
          ),
      },

      { path: "", redirectTo: AUTH_ROUTES_ENUM.LOGIN, pathMatch: "full" },
    ],
  },
];
