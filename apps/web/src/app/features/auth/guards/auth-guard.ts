import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AUTH_ROUTES_ENUM } from "@auth/auth.routes";
import { filter, take, map } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";
import { StartupStore } from "@stores/startup.store";

export const AuthGuard: CanActivateFn = (route, state) => {
  const startupStore = inject(StartupStore);
  const router = inject(Router);

  return toObservable(startupStore.status).pipe(
    filter((status) => status !== "LOADING"), //todo: review include: && status !== "IDLE"
    take(1),
    map((status) => {
      if (status === "READY") {
        return true;
      }

      return router.createUrlTree([AUTH_ROUTES_ENUM.LOGIN]);
    }),
  );
};
