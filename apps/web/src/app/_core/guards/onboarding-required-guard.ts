import { inject } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { CanActivateFn, Router } from "@angular/router";
import { DASHBOARD_ROUTES_ENUM } from "@dashboard/dashboard.routes";
import { UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { ProfileStore } from "@stores/profile.store";
import { filter, map, take } from "rxjs";
import { ONBOARDING_ROUTES_ENUM } from "../../features/onboarding";

export const onboardingRequiredGuard: CanActivateFn = (route, state) => {
  // const authStore = inject(AuthStore);
  const profileStore = inject(ProfileStore);
  const router = inject(Router);
  const onboardingRoute = `/${ONBOARDING_ROUTES_ENUM.HOME}`;
  const dashboardRoute = `/${DASHBOARD_ROUTES_ENUM.HOME}`;

  return toObservable(profileStore.callState).pipe(
    filter((state) => state === "loaded"),
    take(1),
    map((st) => {
      const user = profileStore.user();
      if (!user) return false;

      //if pending and not going to onboarding -> redirect to onboarding
      if (
        user.status?.name === UserStatusEnum.PENDING &&
        !state.url.includes(onboardingRoute)
      ) {
        return router.createUrlTree([onboardingRoute]);
      }

      //if not pending and going to onboarding -> redirect to dashboard
      if (
        user.status.name === UserStatusEnum.ACTIVE &&
        state.url.includes(onboardingRoute)
      ) {
        return router.createUrlTree([dashboardRoute]);
      }

      return true;
    }),
  );
};
