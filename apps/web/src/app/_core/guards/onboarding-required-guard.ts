import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {DASHBOARD_ROUTES_ENUM} from '@dashboard/dashboard.routes';
import {UserStatusEnum} from '@nexhouse/shared-domain/enums';
import {UserStore} from '@user/user.store';
import {ONBOARDING_ROUTES_ENUM} from '../../features/onboarding';

export const onboardingRequiredGuard: CanActivateFn = (route, state) => {
  const profileStore = inject(UserStore);
  const router = inject(Router);
  const onboardingRoute = `/${ONBOARDING_ROUTES_ENUM.HOME}`;
  const dashboardRoute = `/${DASHBOARD_ROUTES_ENUM.HOME}`;

  const status = profileStore.status();
  // Profile not loaded yet (e.g. right after login, before the ShellResolver ran):
  // there is nothing to decide, so let the resolver initialize the app and redirect
  // PENDING_ONBOARDING users. Returning false here would cancel the navigation and
  // leave the splash stuck on LOADING with the URL still on /auth/login.
  if (!status) return true;

  //if pending and not going to onboarding -> redirect to onboarding
  if (status.name === UserStatusEnum.PENDING_ONBOARDING && !state.url.includes(onboardingRoute)) {
    return router.createUrlTree([onboardingRoute]);
  }

  //if not pending and going to onboarding -> redirect to dashboard
  if (status.name === UserStatusEnum.ACTIVE && state.url.includes(onboardingRoute)) {
    return router.createUrlTree([dashboardRoute]);
  }

  return true;

  // return toObservable(profileStore.loaded).pipe(
  //   filter((loaded) => loaded),
  //   take(1),
  //   map(() => {
  //     const status = profileStore.status();
  //     if (!status) return false;
  //
  //     //if pending and not going to onboarding -> redirect to onboarding
  //     if (
  //       status.name === UserStatusEnum.PENDING_ONBOARDING &&
  //       !state.url.includes(onboardingRoute)
  //     ) {
  //       return router.createUrlTree([onboardingRoute]);
  //     }
  //
  //     //if not pending and going to onboarding -> redirect to dashboard
  //     if (
  //       status.name === UserStatusEnum.ACTIVE &&
  //       state.url.includes(onboardingRoute)
  //     ) {
  //       return router.createUrlTree([dashboardRoute]);
  //     }
  //
  //     return true;
  //   }),
  // );
};
