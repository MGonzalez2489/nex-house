import { HttpInterceptorFn } from '@angular/common/http';
import { APP_CONSTANTS } from '../constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(APP_CONSTANTS.TOKEN_STORAGE_KEY);

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }
  return next(req);
};
