import {HttpInterceptorFn} from '@angular/common/http';
import {APP_CONSTANTS} from '@core/constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(APP_CONSTANTS.TOKEN_STORAGE_KEY);
  const pwdToken = localStorage.getItem(APP_CONSTANTS.TOKEN_RESET_PWD);

  const reqToken = token ? token : pwdToken;

  if (reqToken) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${reqToken}`,
      },
    });
    return next(clonedReq);
  }
  return next(req);
};
