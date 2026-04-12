import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { InputTextModule } from 'primeng/inputtext';

import { JsonPipe } from '@angular/common';
import { FinanceStore } from '@features/finance/stores';
import { FeeScheduleTypeEnum, FrecuencyEnum } from '@nex-house/enums';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { toSignal } from '@angular/core/rxjs-interop';
import { ICreateFeeSchedule } from '@nex-house/interfaces';
import { SelectButtonModule } from 'primeng/selectbutton';

type CreateFeeScheduleForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  amount: FormControl<number>;
  type: FormControl<string>;
  startDate: FormControl<string | undefined>;
  //recurrency
  frecuency: FormControl<string | undefined>;
  dayOfWeek: FormControl<number | undefined>;
  dayOfMonth: FormControl<number | undefined>;
  endDate: FormControl<string | undefined>;
};

@Component({
  selector: 'app-fee-schedule-form',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    FormValidationError,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    FormOptions,
    JsonPipe,
    SelectButtonModule,
    SelectModule,
  ],
  templateUrl: './fee-schedule-form.html',
  styleUrl: './fee-schedule-form.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeScheduleForm {
  protected readonly form = new FormGroup<CreateFeeScheduleForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl(undefined, { nonNullable: true }),
    amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    type: new FormControl(FeeScheduleTypeEnum.RECURRENT, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    //recurrency
    frecuency: new FormControl(undefined, { nonNullable: true }),
    dayOfMonth: new FormControl(undefined, { nonNullable: true }),
    dayOfWeek: new FormControl(undefined, { nonNullable: true }),
    endDate: new FormControl(undefined, { nonNullable: true }),
  });
  protected readonly store = inject(FinanceStore);
  protected readonly types = [
    { key: 'Recurrente', value: FeeScheduleTypeEnum.RECURRENT },
    { key: 'Unico', value: FeeScheduleTypeEnum.ONE_TIME },
  ];
  protected readonly frecuency = [
    {
      key: 'Semanalmente',
      value: FrecuencyEnum.WEEKLY,
    },
    {
      key: 'Mensualmente',
      value: FrecuencyEnum.MONTHLY,
    },
    {
      key: 'Anualmente',
      value: FrecuencyEnum.YEARLY,
    },
  ];
  protected readonly save = output();
  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });
  protected readonly isRecurrent = computed(
    () => this.formValue()?.type === FeeScheduleTypeEnum.RECURRENT,
  );

  protected readonly fFrecuency = toSignal(
    this.form.controls.frecuency.valueChanges,
  );
  protected readonly daysOfWeek = [
    { key: 'Domingo', value: 0 },
    { key: 'Lunes', value: 1 },
    { key: 'Martes', value: 2 },
    { key: 'Miercoles', value: 3 },
    { key: 'Jueves', value: 4 },
    { key: 'Viernes', value: 5 },
    { key: 'Sabado', value: 6 },
  ];
  protected readonly daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  constructor() {
    effect(() => {
      const cIsRecurrent = this.isRecurrent();
      if (cIsRecurrent) {
        this.setupRecurrentForm();
        return;
      }

      this.cleanRecurrentForm();
    });

    effect(() => {
      const cFrecuency = this.fFrecuency();
      if (!cFrecuency) return;

      switch (cFrecuency) {
        case FrecuencyEnum.WEEKLY:
          this.setupWeeklyRecurrence();
          break;
        case FrecuencyEnum.MONTHLY:
          this.setupMonthlyRecurrence();
          break;
        case FrecuencyEnum.YEARLY:
          this.setupYearlyRecurrence();
          break;
        default:
          console.log(`Frecuency ${cFrecuency} not implemented`);
      }

      this.form.updateValueAndValidity();
    });
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const success = await this.store.feeScheduleCreate(
      raw as ICreateFeeSchedule,
    );
    if (success) {
      this.doCancel();
    }
  }

  doCancel(): void {
    this.form.reset();

    this.save.emit();
  }

  private setupRecurrentForm(): void {
    this.form.patchValue({
      frecuency: FrecuencyEnum.WEEKLY,
      dayOfWeek: this.daysOfWeek[0].value,
    });

    this.form.updateValueAndValidity();
  }
  private cleanRecurrentForm(): void {
    this.form.patchValue({
      frecuency: undefined,
      dayOfWeek: undefined,
      dayOfMonth: undefined,
      endDate: undefined,
    });

    this.form.controls.dayOfWeek.clearValidators();
    this.form.controls.dayOfWeek.markAsPristine();
    this.form.controls.dayOfWeek.markAsUntouched();
    this.form.controls.dayOfMonth.clearValidators();
    this.form.controls.dayOfMonth.markAsPristine();
    this.form.controls.dayOfMonth.markAsUntouched();
  }
  private setupWeeklyRecurrence(): void {
    const start = this.form.controls.startDate.value;
    const defaultDay = start ? new Date(start).getDay() : 0;

    this.form.patchValue({
      dayOfMonth: undefined,
      dayOfWeek: defaultDay,
    });

    this.form.controls.dayOfWeek.addValidators([Validators.required]);
    this.form.controls.dayOfMonth.clearValidators();

    this.form.controls.dayOfWeek.updateValueAndValidity();
    this.form.controls.dayOfMonth.updateValueAndValidity();
  }
  private setupMonthlyRecurrence(): void {
    this.form.patchValue({
      dayOfWeek: undefined,
      dayOfMonth: 1,
    });

    this.form.controls.dayOfMonth.addValidators([Validators.required]);
    this.form.controls.dayOfWeek.clearValidators();

    this.form.controls.dayOfWeek.updateValueAndValidity();
    this.form.controls.dayOfMonth.updateValueAndValidity();
  }
  private setupYearlyRecurrence(): void {
    this.form.patchValue({
      dayOfWeek: undefined,
      dayOfMonth: undefined,
    });

    this.form.controls.dayOfWeek.clearValidators();
    this.form.controls.dayOfMonth.clearValidators();

    this.form.controls.dayOfWeek.updateValueAndValidity();
    this.form.controls.dayOfMonth.updateValueAndValidity();
  }
}
