import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AUTH_ROUTES_ENUM} from '@auth/auth.routes';
import {AuthStore} from '@auth/store';
import {IconFieldModule} from '@openng/optimus-ui/iconfield';
import {InputIconModule} from '@openng/optimus-ui/inputicon';
import {InputTextModule} from '@openng/optimus-ui/inputtext';
import {FormOptions, FormValidationErrorComponent} from '@shared/components/forms';

@Component({
  selector: 'app-pass-recovery-request-page',
  imports: [
    InputTextModule,
    FormOptions,
    ReactiveFormsModule,
    FormValidationErrorComponent,
    RouterLink,
    InputIconModule,
    IconFieldModule,
  ],
  templateUrl: './pass-recovery-request-page.html',
  styleUrl: './pass-recovery-request-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassRecoveryRequestPage {
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);
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
