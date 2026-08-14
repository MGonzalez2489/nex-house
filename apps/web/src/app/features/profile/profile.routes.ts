import { Routes } from "@angular/router";

export enum PROFILE_ROUTES_ENUM {
  HOME = "profile",
}

export const PROFILE_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/profile-home-page/profile-home-page").then(
        (c) => c.ProfileHomePage,
      ),
  },
];
