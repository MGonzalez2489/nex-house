import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ICreateUser } from '@nex-house/interfaces';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { ContextStore } from '@stores/context.store';
import { UnitsStore } from '@features/housing-unit/units.store';
import { UsersStore } from '@features/users/users.store';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ICreateUserForm, IUserUnitForm } from './iuser-form';
import { UserRoleEnum } from '@nex-house/enums';

@Component({
  selector: 'app-user-form-page',
  imports: [
    ReactiveFormsModule,
    Card,
    FormValidationError,
    InputTextModule,
    InputMaskModule,
    ButtonModule,
    FormOptions,
    AutoCompleteModule,
    CheckboxModule,
    RadioButtonModule,
    ToggleSwitchModule,
  ],
  templateUrl: './user-form-page.html',
  styleUrl: './user-form-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormPage {
  protected readonly store = inject(UsersStore);
  protected readonly unitStore = inject(UnitsStore);
  protected readonly contextStore = inject(ContextStore);
  protected readonly form = new FormGroup<ICreateUserForm>({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    lastName: new FormControl(null, {
      validators: [Validators.minLength(3)],
    }),
    phone: new FormControl(null, {
      validators: [Validators.minLength(3)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    unit: new FormControl(null, {
      validators: [Validators.required],
    }),
    newUnit: new FormGroup<IUserUnitForm>({
      streetName: new FormControl<string>('', { nonNullable: true }),
      identifier: new FormControl<string>('', { nonNullable: true }),
    }),
    isAdmin: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isOwner: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isFamily: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isTenant: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  protected readonly isNewUnit = signal<boolean>(false);
  private readonly router = inject(Router);
  private readonly exclusiveFields = [
    'isOwner',
    'isFamily',
    'isTenant',
  ] as const;
  id = input<string | undefined>();
  isEdit = computed(() => !!this.id());

  suggestions = computed(() => {
    return this.unitStore.suggestions().map((f) => ({
      ...f,
      labelFull: `${f.street} #${f.identifier}`,
    }));
  });

  constructor() {
    effect(async () => {
      const userId = this.id();
      if (userId) {
        const user = await this.store.findById(userId);

        if (!user) return;
        const assignment = user.assignments ? user.assignments[0] : null;
        const unit = user.assignments ? user.assignments[0].unit : null;

        if (unit) {
          this.isNewUnit.set(false);

          const unitForAutocomplete = {
            ...unit,
            labelFull: `${assignment?.unit?.street} #${assignment?.unit?.identifier}`,
          };

          this.form.patchValue({
            isOwner: assignment?.isOwner,
            isFamily: assignment?.isFamily,
            isTenant: assignment?.isTenant,
            unit: unitForAutocomplete,
          });
        }

        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          isAdmin: user.role === UserRoleEnum.ADMIN,
        });
      } else {
        this.form.reset();
      }
    });

    effect(() => {
      this.syncUnitValidators(this.isNewUnit());
    });

    this.setupExclusiveFieldsLogic();
  }

  searchUnit(event: AutoCompleteCompleteEvent) {
    //TODO: add debounce
    this.unitStore.searchSuggestions(event.query);
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const userId = this.id();
    const payload: ICreateUser = {
      firstName: raw.firstName,
      lastName: raw.lastName ? raw.lastName : null,
      email: raw.email,
      phone: raw.phone,

      isAdmin: raw.isAdmin,
      isOwner: raw.isOwner,
      isFamily: raw.isFamily,
      isTenant: raw.isTenant,
    };

    if (raw.unit) {
      payload.unitId = raw.unit.publicId;
    } else if (raw.newUnit) {
      payload.streetName = raw.newUnit.streetName;
      payload.identifier = raw.newUnit.identifier;
    } else {
      alert("there's something wrong");
    }

    const success = userId
      ? await this.store.update(userId, payload)
      : await this.store.create(payload);

    if (success) {
      this.navigateBack();
    }
  }
  doCancel() {
    this.navigateBack();
  }

  private setupExclusiveFieldsLogic() {
    this.exclusiveFields.forEach((field) => {
      this.form
        .get(field)
        ?.valueChanges.pipe(takeUntilDestroyed())
        .subscribe((value) => {
          if (value) this.clearOtherFields(field);
        });
    });
  }
  private clearOtherFields(selectedField: string) {
    this.exclusiveFields
      .filter((f) => f !== selectedField)
      .forEach((f) => {
        this.form.get(f)?.setValue(false, { emitEvent: false });
      });
  }
  private syncUnitValidators(isNew: boolean) {
    const { newUnit, unit } = this.form.controls;
    const { identifier, streetName } = newUnit.controls;

    if (isNew) {
      unit.setValue(null, { emitEvent: false });
      unit.clearValidators();
      identifier.setValidators([Validators.required]);
      streetName.setValidators([Validators.required]);
    } else {
      unit.patchValue(null, { emitEvent: false });
      identifier.clearValidators();
      streetName.clearValidators();
      unit.setValidators([Validators.required]);
    }

    [unit, identifier, streetName].forEach((c) =>
      c.updateValueAndValidity({ emitEvent: false }),
    );
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private navigateBack() {
    const sel = this.contextStore.selectedId();
    this.router.navigateByUrl(`/neighborhoods/${sel}/users`);
  }
}
