import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { UserProfileModel } from "@nexhouse/shared-domain/models";
import { ProfileFormComponent } from "@shared/components/forms";
import { Button } from "primeng/button";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-onboarding-general-component",
  imports: [Panel, Button, ProfileFormComponent],
  templateUrl: "./onboarding-general-component.html",
  styleUrl: "./onboarding-general-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingGeneralComponent {
  profile = input<UserProfileModel>();
  isLoading = input.required<boolean>();

  next = output();
  doSubmit = output<FormData>();
  prev = output();
}
