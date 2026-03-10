import { Component, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ILogin } from '@nex-house/interfaces';
import { AuthStore } from '@stores/auth.store';
import { ButtonModule } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { FormValidationError } from '@shared/components/ui';
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
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);

  protected readonly form = new FormGroup<ILoginForm>({
    email: new FormControl('root@test.com', {
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
      if (this.store.token()) {
        this.router.navigateByUrl('/app');
      }
    });
  }

  doSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const request: ILogin = this.form.getRawValue();
    this.store.login(request);
  }
}
