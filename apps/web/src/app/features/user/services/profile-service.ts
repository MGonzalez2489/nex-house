import { inject, Injectable } from "@angular/core";
import { RequestService } from "@core/services";
import { UserProfileModel } from "@nexhouse/shared-domain/models";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/user/profile";

  get() {
    return this.request.get<UserProfileModel>(this.endpoint);
  }

  update(dto: FormData) {
    return this.request.patch<UserProfileModel>(this.endpoint, dto);
  }
}
