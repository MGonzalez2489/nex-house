/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  IBulkCreateHousingUnit,
  ICreateHousingUnit,
} from '@nex-house/interfaces';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { UnitsStore } from '@stores/units.store';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-unit-form',
  imports: [
    SelectButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    FormValidationError,
    FormOptions,
  ],
  templateUrl: './unit-form.html',
  styleUrl: './unit-form.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitForm implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  protected readonly store = inject(UnitsStore);
  protected readonly form = new FormGroup({
    mode: new FormControl('single', { nonNullable: true }),
    identifier: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    streetName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.min(3)],
    }),
    startNumber: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    endNumber: new FormControl(10, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });
  protected readonly modeOptions = [
    { label: 'Individual', value: 'single' },
    { label: 'Masivo (Bulk)', value: 'bulk' },
  ];

  ngOnInit(): void {
    this.form.get('mode')?.valueChanges.subscribe((mode) => {
      this.updateValidators(mode);
    });
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { mode, ...values } = this.form.value;
    let success;

    if (mode === 'single') {
      const dto: ICreateHousingUnit = {
        identifier: values.identifier!,
        streetName: values.streetName!,
      };
      success = await this.store.create(dto);
    } else {
      const dto: IBulkCreateHousingUnit = {
        streetName: values.streetName!,
        startNumber: values.startNumber!,
        endNumber: values.endNumber!,
      };
      success = await this.store.bulkCreate(dto);
    }
    if (success) {
      this.ref.close();
    }
  }
  doCancel() {
    this.ref.close();
  }

  get f() {
    return this.form.controls;
  }

  private updateValidators(mode: string | null) {
    const isSingle = mode === 'single';

    // Si es single, identifier es requerido. Si no, no.
    this.f.identifier.setValidators(isSingle ? [Validators.required] : []);
    this.f.startNumber.setValidators(
      !isSingle ? [Validators.required, Validators.min(1)] : [],
    );
    this.f.endNumber.setValidators(
      !isSingle ? [Validators.required, Validators.min(1)] : [],
    );

    // Limpiamos y actualizamos
    this.f.identifier.updateValueAndValidity();
    this.f.startNumber.updateValueAndValidity();
    this.f.endNumber.updateValueAndValidity();
  }

  // Validador de rango: asegura que FIN sea > INICIO
  private rangeValidator(control: AbstractControl): ValidationErrors | null {
    const mode = control.get('mode')?.value;
    const start = control.get('startNumber')?.value;
    const end = control.get('endNumber')?.value;

    if (mode === 'bulk' && start >= end) {
      return { rangeInvalid: true };
    }
    return null;
  }
}
