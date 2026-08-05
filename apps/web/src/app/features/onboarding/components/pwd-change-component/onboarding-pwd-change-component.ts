import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ChangePassword } from "@nexhouse/shared-domain/interfaces";
import { UserModel } from "@nexhouse/shared-domain/models";
import { FormValidationErrorComponent } from "@shared/components/forms";
import { Button } from "primeng/button";
import { Panel } from "primeng/panel";
import { PasswordModule } from "primeng/password";

@Component({
  selector: "app-onboarding-pwd-change-component",
  imports: [
    PasswordModule,
    ReactiveFormsModule,
    FormValidationErrorComponent,
    Panel,
    Button,
  ],
  templateUrl: "./onboarding-pwd-change-component.html",
  styleUrl: "./onboarding-pwd-change-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPwdChangeComponent {
  user = input<UserModel>();
  next = output();
  doSubmit = output<ChangePassword>();
  prev = output();

  requirePwdChange = computed(() => {
    const cUser = this.user();
    if (!cUser) return true;

    return cUser.requirePwdChange;
  });

  private passwordsMatchValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    // Ensure the control is a FormGroup before proceeding
    if (!(control instanceof FormGroup)) {
      return null;
    }
    const formGroup = control;
    const newPwd = formGroup.get("newPwd");
    const confirmPwd = formGroup.get("confirmPwd");

    // Only validate if both controls exist and have values
    if (newPwd && confirmPwd && newPwd.value !== confirmPwd.value) {
      // Set error on the confirmPwd control for better UX
      confirmPwd.setErrors({ mismatch: true });
      return { mismatch: true }; // Return error at the form group level
    }

    // If they match, clear the error from confirmPwd if it was previously set
    if (confirmPwd && confirmPwd.hasError("passwordsMismatch")) {
      confirmPwd.setErrors(null);
    }
    return null; // Pass validation
  };

  protected readonly form = new FormGroup(
    {
      currentPwd: new FormControl<string>("", {
        nonNullable: true,
        validators: [Validators.required],
      }),
      newPwd: new FormControl<string>("", {
        nonNullable: true,
        validators: [Validators.required],
      }),
      confirmPwd: new FormControl("", {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [this.passwordsMatchValidator] },
  );

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { newPwd, currentPwd } = this.form.value;

    if (!newPwd || !currentPwd) return;

    this.doSubmit.emit({ newPassword: newPwd, oldPassword: currentPwd });
  }
}
