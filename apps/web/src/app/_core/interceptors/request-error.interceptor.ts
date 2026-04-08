import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ErrorService } from '@core/services/error.service';
import { catchError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService); // Inyecta el servicio de errores
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      return errorService.handleError(error);
    }),
  );
};
