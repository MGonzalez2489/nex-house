import {inject, Injectable} from '@angular/core';
import {RequestService} from '@core/services';
import {
  ApiResponse,
  Login,
  RecoveryCodeResponse,
  ResetPasswordToken,
} from '@nexhouse/shared-domain/interfaces';
import {SessionModel} from '@nexhouse/shared-domain/models';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/auth';

  login(credentials: Login): Observable<ApiResponse<SessionModel>> {
    return this.request.post<SessionModel>(`${this.endpoint}/login`, credentials);
  }

  refreshSession() {
    return this.request.post<SessionModel>(`${this.endpoint}/refresh`, {}, undefined, {
      withCredentials: true,
    });
  }

  //pwd recovery

  recoveryRequest(email: string): Observable<ApiResponse<RecoveryCodeResponse>> {
    return this.request.post<RecoveryCodeResponse>(`${this.endpoint}/pwd-recovery-request`, {
      email,
    });
  }
  codeValidation(code: string): Observable<ApiResponse<ResetPasswordToken>> {
    return this.request.post<ResetPasswordToken>(`${this.endpoint}/code-validation`, {
      code,
    });
  }
  resetPwd(pwd: string): Observable<ApiResponse<SessionModel>> {
    return this.request.post<SessionModel>(`${this.endpoint}/reset-password`, {
      pwd,
    });
  }
}
