import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ILogin } from '@nex-house/interfaces';
import { ButtonModule } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthStore } from '@features/auth';
import { DASHBOARD_ROUTES_ENUM } from '@features/dashboard';
import { FormFeedback, FormValidationError } from '@shared/components/ui';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

type ILoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    InputTextModule,
    Checkbox,
    InputIconModule,
    IconFieldModule,
    FormValidationError,
    RouterLink,
    FormFeedback,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);

  protected readonly form = new FormGroup<ILoginForm>({
    email: new FormControl('admin@test.com', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('1234', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
  });

  constructor() {
    effect(() => {
      if (this.store.isAuthenticated()) {
        this.router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`);
      }
    });
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const request: ILogin = this.form.getRawValue();
    const response = await this.store.login(request);

    if (response) {
      this.router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`);
    }
  }
}
