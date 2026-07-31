import { Routes } from "@angular/router";

export enum UNIT_ROUTES_ENUM {
  HOME = "units",
  // NEW = "new",
  DETAILS = ":id",
  // UPDATE = ":id/edit",
}

export const UNIT_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/units-home-page/units-home-page").then(
        (c) => c.UnitsHomePage,
      ),
  },
];
