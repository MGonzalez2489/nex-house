import { inject, Injectable } from '@angular/core';
import { RequestService } from '@core/services';
import { ILogin, ApiResponse } from '@nex-house/interfaces';
import { SessionModel } from '@nex-house/models';
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
}
