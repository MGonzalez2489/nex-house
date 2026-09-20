import {inject} from '@angular/core';
import {ResolveFn, Router} from '@angular/router';
import {PAGES_ROUTES_ENUM} from '../../../pages/pages.routes';
import {UserStore} from '@user/user.store';
import {UserStatusEnum} from '@nexhouse/shared-domain/enums';
import {DASHBOARD_ROUTES_ENUM} from '@dashboard/dashboard.routes';
import {OnboardingStore} from '@onboarding/onboarding.store';

export const loadResolver: ResolveFn<boolean> = async (route, state) => {
  const router = inject(Router);
  const onboardingStore = inject(OnboardingStore);
  const userStore = inject(UserStore);

  // Deduplicate: skip a redundant load if we already have data or are fetching.
  if (onboardingStore.steps().length === 0 && !onboardingStore.loading()) {
    await onboardingStore.load();
  }

  if (onboardingStore.error()) {
    router.navigateByUrl(`/${PAGES_ROUTES_ENUM.UNAUTHORIZED}`, {
      replaceUrl: true,
    });
    return false;
  }

  // A user with an active (non-pending) status has no onboarding to complete;
  // send them straight to the dashboard instead of the onboarding flow.
  if (userStore.status()?.name === UserStatusEnum.ACTIVE) {
    router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`, {replaceUrl: true});
    return false;
  }

  return true;
};
