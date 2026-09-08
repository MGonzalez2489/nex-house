import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { LoginForm } from "./login-form";

import { AuthStore } from "@auth/store";
import { DASHBOARD_ROUTES_ENUM } from "@dashboard/index";
import { ONBOARDING_ROUTES_ENUM } from "@onboarding/onboarding.routes";
import { UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { Login } from "@nexhouse/shared-domain/interfaces";
import { UserStore } from "@user/user.store";
import {
  FormOptions,
  FormValidationErrorComponent,
} from "@shared/components/forms";
import { StartupStore } from "@stores/startup.store";
import { Checkbox } from "@openng/optimus-ui/checkbox";
import { IconFieldModule } from "@openng/optimus-ui/iconfield";
import { InputIconModule } from "@openng/optimus-ui/inputicon";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { PasswordModule } from "@openng/optimus-ui/password";

@Component({
  selector: "app-login-page",
  imports: [
    ReactiveFormsModule,
    PasswordModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    RouterLink,
    Checkbox,
    FormValidationErrorComponent,
    FormOptions,
  ],
  templateUrl: "./login-page.html",
  styleUrl: "./login-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  protected readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly startupStore = inject(StartupStore);
  private readonly userStore = inject(UserStore);

  protected readonly form = new FormGroup<LoginForm>({
    email: new FormControl("root@test.com", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl("1234", {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
  });

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    try {
      const request: Login = this.form.getRawValue();
      const response = await this.store.login(request);

      if (response) {
        await this.startupStore.initializeApp();

        const pendingOnboarding =
          this.userStore.status()?.name === UserStatusEnum.PENDING_ONBOARDING;
        const destination = pendingOnboarding
          ? `/${ONBOARDING_ROUTES_ENUM.HOME}`
          : `/${DASHBOARD_ROUTES_ENUM.HOME}`;

        await this.router.navigateByUrl(destination);
      }
    } catch (error) {
      console.error("error", error);
    } finally {
      this.store.finishLogin();
    }
  }
}
