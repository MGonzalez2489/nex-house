import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from "@angular/core";
import { Button } from "primeng/button";
import { Panel } from "primeng/panel";
import { UserProfileModel } from "@nexhouse/shared-domain/models";

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
  complete = output();

  // private readonly router = inject(Router);
  // readonly user = input<UserModel>();
  // readonly profile = input<UserProfileModel>();
  //
  // goDashboard() {
  //   // this.router.resetConfig(DASHBOARD_ROUTES);
  //   // const urlTree = this.router.createUrlTree([
  //   //   `/${DASHBOARD_ROUTES_ENUM.HOME}`,
  //   // ]);
  //   this.router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`);
  // }
}
