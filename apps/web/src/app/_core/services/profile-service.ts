import { inject, Injectable } from "@angular/core";
import { UserModel, UserProfileModel } from "@nexhouse/shared-domain/models";
import { RequestService } from "./request.service";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/profile";

  get() {
    return this.request.get<UserModel>(this.endpoint);
  }

  update(dto: FormData) {
    return this.request.patch<UserProfileModel>(this.endpoint, dto);
  }

  // update(dto: UpdateUser) {
  //   return this.request.patch<UserModel>(this.endpoint, dto);
  // }
}
