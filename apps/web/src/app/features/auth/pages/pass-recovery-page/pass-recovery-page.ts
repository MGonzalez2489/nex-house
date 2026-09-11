import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthStore} from '@auth/store';
import {DASHBOARD_ROUTES_ENUM} from '@dashboard/dashboard.routes';
import {IconFieldModule} from '@openng/optimus-ui/iconfield';
import {InputIconModule} from '@openng/optimus-ui/inputicon';
import {PasswordModule} from '@openng/optimus-ui/password';
import {FormOptions, FormValidationErrorComponent} from '@shared/components/forms';
import {StartupStore} from '@stores/startup.store';

type ResetPwdForm = {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};

@Component({
  selector: 'app-pass-recovery-page',
  imports: [
    ReactiveFormsModule,
    PasswordModule,
    InputIconModule,
    IconFieldModule,
    FormValidationErrorComponent,
    FormOptions,
  ],
  templateUrl: './pass-recovery-page.html',
  styleUrl: './pass-recovery-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassRecoveryPage {
  protected readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly startupStore = inject(StartupStore);

  readonly form = new FormGroup<ResetPwdForm>({
    password: new FormControl('1234', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
    confirmPassword: new FormControl('1234', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
  });

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const {password} = this.form.value;
    if (!password) return;

    const response = await this.store.resetPwd(password);
    if (response) {
      this.startupStore.armLoading();
      this.router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`);
    }
  }
}
