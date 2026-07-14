import { Routes } from "@angular/router";

export enum NEIGHBORHOOD_ROUTES_ENUM {
  HOME = "neighborhoods",
}

export const NEIGHBORHOOD_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./neighborhoods-container").then((c) => c.NeighborhoodsContainer),
  },
  {
    path: "**",
    redirectTo: "",
  },
];
