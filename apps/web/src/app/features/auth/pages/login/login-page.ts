import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { LoginForm } from "./login-form";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { Checkbox } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { FormValidationErrorComponent } from "@shared/components/forms";

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
    console.log("submit");
  }
}
