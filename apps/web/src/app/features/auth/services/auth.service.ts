import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RequestService } from '@core/services';
import { ApiResponse, ILogin } from '@nex-house/interfaces';
import { SessionModel, UserModel } from '@nex-house/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/auth';

  login(credentials: ILogin): Observable<ApiResponse<SessionModel>> {
    return this.request.post<SessionModel>(
      `${this.endpoint}/login`,
      credentials,
    );
  }
  passwordRecovery(email: string) {
    return this.request.post<string>(`${this.endpoint}/password-recovery`, {
      email,
    });
  }
  validateCode(code: string) {
    return this.request.post<string>(`${this.endpoint}/recovery-validate`, {
      code,
    });
  }

  newPassword(token: string, password: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.request.post<SessionModel>(
      `${this.endpoint}/password-reset`,
      {
        password,
      },
      headers,
    );
  }

  me(): Observable<ApiResponse<UserModel>> {
    return this.request.get<UserModel>(`${this.endpoint}/me`);
  }
}
