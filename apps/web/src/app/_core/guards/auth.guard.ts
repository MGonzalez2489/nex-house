import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@core/services';
import { AUTH_ROUTES_ENUM } from '@features/auth/auth.routes';

export const authGuard: CanActivateFn = (state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const token = sessionService.token();

  if (token) {
    return true;
  }

  router.navigate([AUTH_ROUTES_ENUM.LOGIN], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
