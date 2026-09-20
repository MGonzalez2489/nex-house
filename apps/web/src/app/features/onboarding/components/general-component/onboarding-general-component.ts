import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { CallState } from "@ngrx-toolkit/core";
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
  profile = input<UserProfileModel>();
  isLoading = input.required<boolean>();
  callState = input<CallState>();

  next = output();
  doSubmit = output<FormData>();
  prev = output();
}
