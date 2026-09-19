import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AUTH_ROUTES_ENUM} from '@auth/auth.routes';
import {AuthStore} from '@auth/store';

export const AuthGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  if (store.isAuthenticated()) return true;

  const router = inject(Router);
  return router.createUrlTree(['/auth', AUTH_ROUTES_ENUM.LOGIN]);
};
