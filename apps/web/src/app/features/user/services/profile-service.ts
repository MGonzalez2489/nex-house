import { inject, Injectable } from "@angular/core";
import { RequestService } from "@core/services";
import {
  ProfileEditPayload,
  toProfileFormData,
} from "@core/models/profile-edit-payload";
import { ApiResponse } from "@nexhouse/shared-domain/interfaces";
import { UserProfileModel } from "@nexhouse/shared-domain/models";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/user/profile";

  get(): Observable<ApiResponse<UserProfileModel>> {
    return this.request.get<UserProfileModel>(this.endpoint);
  }

  update(dto: ProfileEditPayload): Observable<ApiResponse<UserProfileModel>> {
    return this.request.patch<UserProfileModel>(
      this.endpoint,
      toProfileFormData(dto),
    );
  }
}