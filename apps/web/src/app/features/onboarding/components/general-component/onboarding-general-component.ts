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
import { UpdateUserProfile } from "@nexhouse/shared-domain/interfaces";
import { UserModel, UserProfileModel } from "@nexhouse/shared-domain/models";
import { FormValidationErrorComponent } from "@shared/components/forms";
import { Button } from "primeng/button";
import { InputMaskModule } from "primeng/inputmask";
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
    InputMaskModule,
  ],
  templateUrl: "./onboarding-general-component.html",
  styleUrl: "./onboarding-general-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingGeneralComponent {
  profile = input<UserProfileModel>();
  isLoading = input.required<boolean>();

  next = output();
  doSubmit = output<UpdateUserProfile>();
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
      const cProfile = this.profile();
      if (!cProfile) return;

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
      formValue.phone = formValue.phone.replace(/[\D\s]/g, "");
    }

    if (this.form.dirty) this.doSubmit.emit(formValue as UpdateUserProfile);
    else {
      this.next.emit();
    }
  }
}
