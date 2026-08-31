import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import { Router } from "@angular/router";
import { DASHBOARD_ROUTES_ENUM } from "@dashboard/dashboard.routes";
import { UserModel, UserProfileModel } from "@nexhouse/shared-domain/models";
import { Button } from "primeng/button";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-onboarding-finish-component",
  imports: [Panel, Button],
  templateUrl: "./onboarding-finish-component.html",
  styleUrl: "./onboarding-finish-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingFinishComponent {
  private readonly router = inject(Router);
  readonly user = input<UserModel>();
  readonly profile = input<UserProfileModel>();

  goDashboard() {
    // this.router.resetConfig(DASHBOARD_ROUTES);
    // const urlTree = this.router.createUrlTree([
    //   `/${DASHBOARD_ROUTES_ENUM.HOME}`,
    // ]);
    this.router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`);
  }
}
