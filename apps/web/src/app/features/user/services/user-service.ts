import { inject, Injectable } from "@angular/core";
import { RequestService } from "@core/services";
import { ApiResponse } from "@nexhouse/shared-domain/interfaces";
import { UserModel } from "@nexhouse/shared-domain/models";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/user";

  get(): Observable<ApiResponse<UserModel>> {
    return this.request.get<UserModel>(this.endpoint);
  }
}