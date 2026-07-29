import { Routes } from "@angular/router";

export enum RESIDENT_ROUTES_ENUM {
  HOME = "residents",
  NEW = "new",
  DETAILS = ":id",
  UPDATE = ":id/edit",
}

export const RESIDENT_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/resident-home-page/resident-home-page").then(
        (c) => c.ResidentHomePage,
      ),
  },
  {
    path: RESIDENT_ROUTES_ENUM.NEW,
    loadComponent: () =>
      import("./pages/resident-form-page/resident-form-page").then(
        (c) => c.ResidentFormPage,
      ),
  },
  {
    path: RESIDENT_ROUTES_ENUM.UPDATE,
    loadComponent: () =>
      import("./pages/resident-form-page/resident-form-page").then(
        (c) => c.ResidentFormPage,
      ),
  },
];
