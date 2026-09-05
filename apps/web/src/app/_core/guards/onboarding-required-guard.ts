import { inject } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { CanActivateFn, Router } from "@angular/router";
import { DASHBOARD_ROUTES_ENUM } from "@dashboard/dashboard.routes";
import { UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { filter, map, take } from "rxjs";
import { ONBOARDING_ROUTES_ENUM } from "../../features/onboarding";
import { UserStore } from "@user/user.store";

export const onboardingRequiredGuard: CanActivateFn = (route, state) => {
  const profileStore = inject(UserStore);
  const router = inject(Router);
  const onboardingRoute = `/${ONBOARDING_ROUTES_ENUM.HOME}`;
  const dashboardRoute = `/${DASHBOARD_ROUTES_ENUM.HOME}`;

  return toObservable(profileStore.callState).pipe(
    filter((state) => state === "loaded"),
    take(1),
    map((st) => {
      const status = profileStore.status();
      if (!status) return false;

      //if pending and not going to onboarding -> redirect to onboarding
      if (
        status.name === UserStatusEnum.PENDING_ONBOARDING &&
        !state.url.includes(onboardingRoute)
      ) {
        return router.createUrlTree([onboardingRoute]);
      }

      //if not pending and going to onboarding -> redirect to dashboard
      if (
        status.name === UserStatusEnum.ACTIVE &&
        state.url.includes(onboardingRoute)
      ) {
        return router.createUrlTree([dashboardRoute]);
      }

      return true;
    }),
  );
};
