import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from "@angular/core";
import { CallState } from "@ngrx-toolkit/core";
import { ProfileEditPayload } from "@core/models/profile-edit-payload";
import { UserProfileModel } from "@nexhouse/shared-domain/models";
import { FormOptions, ProfileFormComponent } from "@shared/components/forms";
import { Panel } from "@openng/optimus-ui/panel";

@Component({
  selector: "app-onboarding-general-component",
  imports: [Panel, FormOptions, ProfileFormComponent],
  templateUrl: "./onboarding-general-component.html",
  styleUrl: "./onboarding-general-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingGeneralComponent {
  readonly profile = input<UserProfileModel>();
  readonly isLoading = input.required<boolean>();
  readonly callState = input<CallState>();

  next = output();
  doSubmit = output<ProfileEditPayload>();
  prev = output();

  protected readonly resyncKey = signal(0);

  protected onPrev() {
    this.resyncKey.update((key) => key + 1);
    this.prev.emit();
  }
}
