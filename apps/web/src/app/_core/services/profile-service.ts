import { inject, Injectable } from "@angular/core";
import { RequestService } from "./request.service";
import { UserModel } from "@nexhouse/shared-domain/models";
import { ChangePassword } from "@nexhouse/shared-domain/interfaces";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/profile";

  get() {
    return this.request.get<UserModel>(this.endpoint);
  }

  changePassword(dto: ChangePassword) {
    const response = this.request.patch<boolean>(
      `${this.endpoint}/password`,
      dto,
    );
    return response;
  }
}
