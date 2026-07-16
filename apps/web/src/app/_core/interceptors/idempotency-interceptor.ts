import {
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { tap } from "rxjs";

export const idempotencyInterceptor: HttpInterceptorFn = (req, next) => {
  const HEADER = "x-idempotency-key";
  const STORAGE_PREFIX = "idem_";

  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next(req);
  }

  const fingerPrint = createFingerprint(req);
  const storageKey = STORAGE_PREFIX + fingerPrint;
  let idempotencyKey = sessionStorage.getItem("storageKey");
  if (!idempotencyKey) {
    idempotencyKey = generateKey();
    sessionStorage.setItem(storageKey, idempotencyKey);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      [HEADER]: idempotencyKey,
    },
  });

  return next(clonedRequest).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse && event.ok) {
          sessionStorage.removeItem(storageKey);
        }
      },
    }),
  );
};

function createFingerprint(req: HttpRequest<any>): string {
  const body = req.body ? JSON.stringify(req.body) : "";
  return btoa(`${req.method}|${req.urlWithParams}|${body}`);
}
function generateKey(): string {
  return crypto.randomUUID();
}
