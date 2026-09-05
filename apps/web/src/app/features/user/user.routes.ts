import { Routes } from "@angular/router";

export enum USER_ROUTES_ENUM {
  HOME = "profile",
}

export const USER_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/profile-home-page/profile-home-page").then(
        (c) => c.ProfileHomePage,
      ),
  },
];
