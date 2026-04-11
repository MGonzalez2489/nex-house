import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AUTH_ROUTES_ENUM } from '@features/auth/auth.routes';
import { AuthStore } from '@features/auth/auth.store';
import { FormFeedback, FormValidationError } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-password-recovery',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FormValidationError,
    RouterLink,
    InputTextModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    CheckboxModule,
    FormFeedback,
  ],
  templateUrl: './password-recovery.html',
  styleUrl: './password-recovery.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordRecovery {
  protected readonly store = inject(AuthStore);
  protected readonly form = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  private readonly router = inject(Router);
  recoverySent = false;

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const emailValue = this.form.getRawValue().email;

    const response = await this.store.passRecovery(emailValue);

    if (response && response !== '') {
      console.log('===================', response);
      this.router.navigateByUrl(`auth/${AUTH_ROUTES_ENUM.NEW_PASSWORD}`);
      return;
    }

    this.recoverySent = true;
  }
}
