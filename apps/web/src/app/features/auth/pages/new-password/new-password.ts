import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@features/auth/auth.store';
import { DASHBOARD_ROUTES_ENUM } from '@features/dashboard';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-new-password',
  imports: [
    InputOtpModule,
    ButtonModule,
    InputTextModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    FormOptions,
    FormValidationError,
    PasswordModule,
  ],
  templateUrl: './new-password.html',
  styleUrl: './new-password.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPassword {
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);
  protected readonly codeForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  protected readonly pwdForm = new FormGroup({
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  async sendCode() {
    this.codeForm.markAllAsTouched();
    if (this.codeForm.invalid) return;

    const { code } = this.codeForm.value;

    if (!code) return;

    await this.store.validateCode(code);
  }

  async sendPwd() {
    this.pwdForm.markAllAsTouched();
    if (this.pwdForm.invalid) return;

    const { password } = this.pwdForm.value;

    if (!password) return;

    const response = await this.store.setNewPassword(password);

    if (response) {
      this.router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`);
    }
  }
}
