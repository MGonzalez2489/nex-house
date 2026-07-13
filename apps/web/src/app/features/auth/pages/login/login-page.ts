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
import { Login } from "@nexhouse/shared-domain/interfaces";
import { FormValidationErrorComponent } from "@shared/components/forms";
import { ButtonModule } from "primeng/button";
import { Checkbox } from "primeng/checkbox";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";

@Component({
  selector: "app-login-page",
  imports: [
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    RouterLink,
    Checkbox,
    FormValidationErrorComponent,
  ],
  templateUrl: "./login-page.html",
  styleUrl: "./login-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  protected readonly store = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly form = new FormGroup<LoginForm>({
    email: new FormControl("admin@test.com", {
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

    const request: Login = this.form.getRawValue();
    const response = await this.store.login(request);

    if (response) {
      this.router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`);
    }
  }
}
