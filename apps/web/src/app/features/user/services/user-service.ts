import { inject, Injectable } from "@angular/core";
import { RequestService } from "@core/services";
import { UpdateUser } from "@nexhouse/shared-domain/interfaces";
import { UserModel } from "@nexhouse/shared-domain/models";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/user";

  get() {
    return this.request.get<UserModel>(this.endpoint);
  }

  update(dto: UpdateUser) {
    return this.request.patch<UserModel>(this.endpoint, dto);
  }
}
