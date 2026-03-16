import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ICreateUser } from '@nex-house/interfaces';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { UnitsStore } from '@stores/units.store';
import { UsersStore } from '@stores/users.store';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ICreateUserForm, IUserUnitForm } from '../IUserForm';

import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';

import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-create-user-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FormValidationError,
    FormOptions,
    InputMaskModule,
    AutoCompleteModule,
    ToggleSwitchModule,
    PanelModule,
  ],
  templateUrl: './create-user-form.html',
  styleUrl: './create-user-form.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserForm {
  protected readonly store = inject(UsersStore);
  protected readonly unitStore = inject(UnitsStore);
  private readonly ref = inject(DynamicDialogRef);
  protected readonly form = new FormGroup<ICreateUserForm>({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    unitId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    unit: new FormGroup<IUserUnitForm>({
      streetName: new FormControl<string>('', { nonNullable: true }),
      identifier: new FormControl<string>('', { nonNullable: true }),
    }),
    isAdmin: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  isNewUnit = signal<boolean>(false);

  constructor() {
    effect(() => {
      const cIsNewUnit = this.isNewUnit();
      const { unit, unitId } = this.form.controls;
      const { identifier, streetName } = unit.controls;

      if (cIsNewUnit) {
        unitId.patchValue('');
        identifier.setValidators([Validators.required]);
        streetName.setValidators([Validators.required]);
        unitId.clearValidators();
      } else {
        identifier.patchValue('');
        streetName.patchValue('');
        identifier.clearValidators();
        streetName.clearValidators();
        unitId.setValidators([Validators.required]);
      }

      identifier.updateValueAndValidity({ emitEvent: false });
      streetName.updateValueAndValidity({ emitEvent: false });
      unitId.updateValueAndValidity({ emitEvent: false });

      this.form.updateValueAndValidity({ emitEvent: false });
    });
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const fValue = this.form.getRawValue();

    const payload: ICreateUser = {
      email: fValue.email,
      firstName: fValue.firstName,
      isAdmin: fValue.isAdmin,
      ...(this.isNewUnit()
        ? {
            streetName: fValue.unit.streetName,
            identifier: fValue.unit.identifier,
          }
        : { unitId: fValue.unitId }),
    };

    const success = await this.store.create(payload);
    if (success) {
      this.ref.close();
    }
  }
  doCancel() {
    this.ref.close();
  }

  searchUnit(event: AutoCompleteCompleteEvent) {
    this.unitStore.searchSuggestions(event.query);
  }
}
