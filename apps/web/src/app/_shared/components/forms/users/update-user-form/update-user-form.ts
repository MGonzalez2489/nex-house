import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IUpdateUser } from '@nex-house/interfaces';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { UsersStore } from '@stores/users.store';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-update-user-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FormValidationError,
    FormOptions,
    InputMaskModule,
    ToggleSwitchModule,
  ],
  templateUrl: './update-user-form.html',
  styleUrl: './update-user-form.css',
})
export class UpdateUserForm {
  protected readonly store = inject(UsersStore);
  private readonly ref = inject(DynamicDialogRef);
  protected readonly form = new FormGroup({
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
    value: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload: IUpdateUser = this.form.getRawValue();

    payload.phone = payload.phone.replace(/-/g, '').trim();

    const success = await this.store.update('', payload);
    if (success) {
      this.ref.close();
    }
  }
  doCancel() {
    this.ref.close();
  }
}
