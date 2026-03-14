import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ICreateUser } from '@nex-house/interfaces';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { UsersStore } from '@stores/users.store';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { IUserForm } from './IUserForm';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FormValidationError,
    FormOptions,
    InputMaskModule,
    ToggleSwitchModule,
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserForm {
  protected readonly store = inject(UsersStore);
  private readonly ref = inject(DynamicDialogRef);
  protected readonly form = new FormGroup<IUserForm>({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    isAdmin: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload: ICreateUser = this.form.getRawValue();

    payload.phone = payload.phone.replace(/-/g, '').trim();

    const success = await this.store.create(payload);
    if (success) {
      this.ref.close();
    }
  }
  doCancel() {
    this.ref.close();
  }
}
