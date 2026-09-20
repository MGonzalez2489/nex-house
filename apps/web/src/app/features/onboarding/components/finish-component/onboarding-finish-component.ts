import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { Button } from "@openng/optimus-ui/button";
import { Panel } from "@openng/optimus-ui/panel";
import {
  UserModel,
  UserProfileModel,
  UserRoleModel,
  UserUnitModel,
} from "@nexhouse/shared-domain/models";

@Component({
  selector: "app-onboarding-finish-component",
  imports: [Panel, Button],
  templateUrl: "./onboarding-finish-component.html",
  styleUrl: "./onboarding-finish-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingFinishComponent {
  profile = input<UserProfileModel>();
  user = input<UserModel>();
  role = input<UserRoleModel>();
  units = input<UserUnitModel[]>([]);

  complete = output();

  protected readonly firstName = computed(() => this.profile()?.firstName);

  protected readonly displayName = computed(() => {
    const fullName = this.profile()?.fullName;
    if (fullName && fullName !== "null") {
      return fullName;
    }
    return this.user()?.email ?? "";
  });

  protected readonly unit = computed(() => this.units()[0]);
}
