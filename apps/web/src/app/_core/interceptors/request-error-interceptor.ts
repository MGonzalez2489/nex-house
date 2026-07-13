import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "@auth/services";
import { AuthStore } from "@auth/store";
import { ErrorService } from "@core/services/error-service";
import {
  BehaviorSubject,
  catchError,
  switchMap,
  throwError,
  filter,
  take,
} from "rxjs";

/**
 * ErrorInterceptor
 * * This interceptor handles global HTTP errors. Its primary responsibility is managing
 * 401 Unauthorized errors by attempting a silent token refresh.
 * * Features:
 * - Silent Refresh: Automatically calls the refresh endpoint when a session expires.
 * - Request Queueing: Uses a semaphore (isRefreshing) and a BehaviorSubject to prevent
 * multiple simultaneous refresh calls, queueing subsequent requests until the new
 * token is available.
 * - Global Error Handling: Delegates non-auth errors to the ErrorService.
 */
export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const authService = inject(AuthService);
  const authStore = inject(AuthStore);

  // State variables for the refresh semaphore logic
  let isRefreshing = false;
  const refreshTokenSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes("auth/refresh") &&
        !req.url.includes("auth/login")
      ) {
        return handle401Error(req, next);
      }
      // Fallback for all other types of errors
      return errorService.handleError(error);
    }),
  );

  /**
   * Handles 401 Unauthorized errors by coordinating the token refresh process.
   * * @param req The original failed request.
   * @param next The next interceptor/handler in the chain.
   * @returns An observable that will either retry the original request or logout the user.
   */
  function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn) {
    if (!isRefreshing) {
      isRefreshing = true;
      // Reset the subject so subsequent requests wait for a new value
      refreshTokenSubject.next(null);

      return authService.refreshSession().pipe(
        switchMap((response) => {
          const newSession = response.data;
          // Update global state and release the queue by emitting the new token
          authStore.loadSession(newSession);
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newSession.token}`,
            },
          });
          // Retry the original request with the freshly minted token
          return next(retryReq);
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          // If refresh fails (e.g., expired refresh token), force logout
          // authStore.logout();
          localStorage.clear();
          authStore.resetState();
          return throwError(() => refreshError);
        }),
      );
    } else {
      /**
       * If a refresh is already in progress, we return an observable that:
       * 1. Filters out null values (waiting for the refresh to finish).
       * 2. Takes only the first emission (the new token).
       * 3. Retries the original request.
       */
      return refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => next(addToken(req, token!))),
      );
    }
  }

  /**
   * Helper function to clone a request and append the Authorization header.
   * * @param request The request to be cloned.
   * @param token The JWT access token.
   * @returns A new request instance with the Bearer token header.
   */
  function addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
};
