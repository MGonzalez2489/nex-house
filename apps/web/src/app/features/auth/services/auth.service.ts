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
  me(): Observable<ApiResponse<UserModel>> {
    return this.request.get<UserModel>(`${this.endpoint}/me`);
  }
}
