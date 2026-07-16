import { Routes } from "@angular/router";

export enum NEIGHBORHOOD_ROUTES_ENUM {
  HOME = "neighborhoods",
  NEW = "new",
  DETAILS = ":id",
}

export const NEIGHBORHOOD_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/neigh-home-page/neigh-home-page").then(
        (c) => c.NeighHomePage,
      ),
  },
  {
    path: NEIGHBORHOOD_ROUTES_ENUM.NEW,
    loadComponent: () =>
      import("./pages/neigh-form-page/neigh-form-page").then(
        (c) => c.NeighFormPage,
      ),
  },
  {
    path: NEIGHBORHOOD_ROUTES_ENUM.DETAILS,
    loadComponent: () =>
      import("./pages/neigh-details-page/neigh-details-page").then(
        (m) => m.NeighDetailsPage,
      ),
  },
];
