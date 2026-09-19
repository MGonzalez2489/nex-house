import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthEmailField} from '@auth/components';
import {LoginForm} from './login-form';

import {AuthStore} from '@auth/store';
import {DASHBOARD_ROUTES_ENUM} from '@dashboard/index';
import {Login} from '@nexhouse/shared-domain/interfaces';
import {Checkbox} from '@openng/optimus-ui/checkbox';
import {PasswordModule} from '@openng/optimus-ui/password';
import {FormOptions, FormValidationErrorComponent} from '@shared/components/forms';
import {StartupStore} from '@stores/startup.store';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    PasswordModule,
    RouterLink,
    Checkbox,
    FormValidationErrorComponent,
    FormOptions,
    AuthEmailField,
  ],
  templateUrl: './login-page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  protected readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly startupStore = inject(StartupStore);

  readonly form = new FormGroup<LoginForm>({
    email: new FormControl('root@test.com', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('1234', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
  });

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const request: Login = this.form.getRawValue();
    const response = await this.store.login(request);
    if (response) {
      this.startupStore.armLoading();
      this.router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`);
    }
  }
}
