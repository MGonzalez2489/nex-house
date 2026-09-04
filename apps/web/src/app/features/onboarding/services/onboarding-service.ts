import { inject, Injectable } from "@angular/core";
import { RequestService } from "@core/services";
import { ChangePassword, CreateUnit } from "@nexhouse/shared-domain/interfaces";
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
      `${this.endpoint}/security`,
      dto,
    );
  }

  updateProfile(dto: FormData) {
    return this.request.patch<OnboardingStatusResponseModel>(
      `${this.endpoint}/profile`,
      dto,
    );
  }

  createUnit(dto: CreateUnit) {
    return this.request.post<OnboardingStatusResponseModel>(
      `${this.endpoint}/unit`,
      dto,
    );
  }
  complete() {
    return this.request.post<OnboardingStatusResponseModel>(
      `${this.endpoint}/complete`,
      {},
    );
  }
}
