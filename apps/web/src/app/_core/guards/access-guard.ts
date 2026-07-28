import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { SessionService } from "@core/services";

export const AccessGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const sessionService = inject(SessionService);
    const router = inject(Router);
    const userRole = sessionService.user()?.role?.name || "";

    if (allowedRoles.includes(userRole)) {
      return true;
    }

    return router.parseUrl("/unauthorized");
  };
};
