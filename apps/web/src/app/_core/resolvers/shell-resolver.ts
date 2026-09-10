import {inject} from '@angular/core';
import {ResolveFn, Router} from '@angular/router';
import {UserStatusEnum} from '@nexhouse/shared-domain/enums';
import {ONBOARDING_ROUTES_ENUM} from '@onboarding/onboarding.routes';
import {StartupStore} from '@stores/startup.store';
import {UserStore} from '@user/user.store';

export const ShellResolver: ResolveFn<boolean> = async (route, state) => {
  const startupStore = inject(StartupStore);
  const userStore = inject(UserStore);
  const router = inject(Router);
  if (startupStore.isReady()) return true;

  await startupStore.initializeApp();

  const pendingOnboarding = userStore.status()?.name === UserStatusEnum.PENDING_ONBOARDING;

  if (pendingOnboarding) {
    router.navigateByUrl(`/${ONBOARDING_ROUTES_ENUM.HOME}`);
  }

  return true;
};
