import { inject, Injectable } from "@angular/core";
import { RequestService } from "@core/services";
import {
  ChangePassword,
  UpdateUserProfile,
} from "@nexhouse/shared-domain/interfaces";
import { OnboardingStatusResponseModel } from "@nexhouse/shared-domain/models";

@Injectable({
  providedIn: "root",
})
export class OnboardingService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/onboarding";

  get() {
    return this.request.get<OnboardingStatusResponseModel>(
      `${this.endpoint}/status`,
    );
  }

  changePassword(dto: ChangePassword) {
    return this.request.patch<OnboardingStatusResponseModel>(
      `${this.endpoint}/password`,
      dto,
    );
  }

  updateProfile(dto: UpdateUserProfile) {
    return this.request.patch<OnboardingStatusResponseModel>(
      `${this.endpoint}/profile`,
      dto,
    );
  }
}
