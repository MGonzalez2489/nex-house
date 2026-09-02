import { Routes } from "@angular/router";
import { loadResolver } from "./resolvers/load-resolver"; // Import the loadResolver

export enum ONBOARDING_ROUTES_ENUM {
  HOME = "onboarding",
}

export const ONBOARDING_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/onboarding-home-page/onboarding-home-page").then(
        (c) => c.OnboardingHomePage,
      ),
    resolve: {
      onboardingData: loadResolver,
    },
  },
];
