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
import { UpdateUser } from "@nexhouse/shared-domain/interfaces";
import { UserModel, UserProfileModel } from "@nexhouse/shared-domain/models";
import { FormValidationErrorComponent } from "@shared/components/forms";
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { Panel } from "primeng/panel";
import { InputMaskModule } from "primeng/inputmask";

@Component({
  selector: "app-onboarding-general-component",
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    FormValidationErrorComponent,
    Panel,
    Button,
    InputMaskModule,
  ],
  templateUrl: "./onboarding-general-component.html",
  styleUrl: "./onboarding-general-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingGeneralComponent {
  user = input<UserModel>();
  profile = input<UserProfileModel>();
  isLoading = input.required<boolean>();

  next = output();
  doSubmit = output<UpdateUser>();
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
      const cProfile = this.profile();
      if (!cUser || !cProfile) return;

      this.form.patchValue({
        firstName: cProfile.firstName,
        lastName: cProfile.lastName,
        phone: cProfile.phone,
      });
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const formValue = { ...this.form.value };
    if (formValue.phone) {
      formValue.phone = formValue.phone.replace(/[\D\s]/g, ""); // Remove all non-digits and whitespace
    }

    if (this.form.dirty) this.doSubmit.emit(formValue as UpdateUser);
    else {
      this.next.emit();
    }
  }
}
