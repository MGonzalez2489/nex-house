import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AUTH_ROUTES_ENUM} from '@auth/auth.routes';
import {AuthEmailField} from '@auth/components';
import {AuthStore} from '@auth/store';
import {FormOptions} from '@shared/components/forms';

@Component({
  selector: 'app-pass-recovery-request-page',
  imports: [FormOptions, ReactiveFormsModule, RouterLink, AuthEmailField],
  templateUrl: './pass-recovery-request-page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassRecoveryRequestPage {
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);
  protected readonly PASS_VALIDATE_CODE = AUTH_ROUTES_ENUM.PASS_VALIDATE_CODE;
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  async onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const {email} = this.form.value;
    if (!email) return;

    const response = await this.store.pwdRecoveryRequest(email);
    if (response) {
      this.router.navigateByUrl(`/auth/${AUTH_ROUTES_ENUM.PASS_VALIDATE_CODE}`);
    }
  }
}
