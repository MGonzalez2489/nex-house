import { inject, Injectable } from "@angular/core";
import { RequestService } from "@core/services";
import { ApiResponse, Login } from "@nexhouse/shared-domain/interfaces";
import { SessionModel } from "@nexhouse/shared-domain/models";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/auth";

  login(credentials: Login): Observable<ApiResponse<SessionModel>> {
    return this.request.post<SessionModel>(
      `${this.endpoint}/login`,
      credentials,
    );
  }
}
