import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UserModel } from "@nexhouse/shared-domain/models";
import { FormValidationErrorComponent } from "@shared/components/forms";
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-onboarding-general-component",
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    FormValidationErrorComponent,
    Panel,
    Button,
  ],
  templateUrl: "./onboarding-general-component.html",
  styleUrl: "./onboarding-general-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingGeneralComponent {
  user = input<UserModel>();

  next = output();
  prev = output();

  protected readonly form = new FormGroup({
    firstName: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl(""),
    phone: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      const cUser = this.user();
      if (!cUser) return;

      this.form.patchValue({
        firstName: cUser.firstName,
        lastName: cUser.lastName,
        phone: cUser.phone,
      });
    });
  }

  doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    console.log("valid form");
  }
}
