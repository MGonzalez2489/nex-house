import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {ChangePassword} from '@nexhouse/shared-domain/interfaces';
import {UserModel} from '@nexhouse/shared-domain/models';
import {Button} from '@openng/optimus-ui/button';
import {Panel} from '@openng/optimus-ui/panel';
import {PasswordModule} from '@openng/optimus-ui/password';
import {FormValidationErrorComponent} from '@shared/components/forms';

@Component({
  selector: 'app-onboarding-pwd-change-component',
  imports: [PasswordModule, ReactiveFormsModule, FormValidationErrorComponent, Panel, Button],
  templateUrl: './onboarding-pwd-change-component.html',
  styleUrl: './onboarding-pwd-change-component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPwdChangeComponent {
  protected readonly Validators = Validators;

  isLoading = input.required<boolean>();
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
    if (!(control instanceof FormGroup)) {
      return null;
    }
    const formGroup = control;
    const newPwd = formGroup.get('newPwd');
    const confirmPwd = formGroup.get('confirmPwd');

    if (!newPwd || !confirmPwd) {
      return null;
    }

    if (newPwd.value !== confirmPwd.value) {
      confirmPwd.setErrors({mismatch: true});
      return {mismatch: true};
    }

    if (confirmPwd.hasError('mismatch')) {
      const remainingErrors = {...confirmPwd.errors};
      delete remainingErrors['mismatch'];
      confirmPwd.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
    }
    return null;
  };

  protected readonly form = new FormGroup(
    {
      currentPwd: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      newPwd: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      confirmPwd: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {validators: [this.passwordsMatchValidator]},
  );

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const {newPwd, currentPwd} = this.form.value;

    if (!newPwd || !currentPwd) return;

    this.doSubmit.emit({newPassword: newPwd, oldPassword: currentPwd});
  }
}
