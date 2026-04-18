import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { InputTextModule } from 'primeng/inputtext';

import { FinanceStore } from '@features/finance/stores';
import { FeeScheduleTypeEnum, FrecuencyEnum } from '@nex-house/enums';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
    type: new FormControl(FeeScheduleTypeEnum.ONE_TIME, {
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
    { key: 'Unico', value: FeeScheduleTypeEnum.ONE_TIME },
    { key: 'Recurrente', value: FeeScheduleTypeEnum.RECURRENT },
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
  protected readonly formState = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });
  protected readonly isRecurrent = computed(
    () => this.formState()?.type === FeeScheduleTypeEnum.RECURRENT,
  );
  protected readonly currentFrecuency = computed(
    () => this.formState()?.frecuency,
  );

  protected readonly today = signal<Date>(new Date());

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
    this.form.controls.type.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((type) =>
        this.syncRecurrenceState(type as FeeScheduleTypeEnum),
      );
    this.form.controls.frecuency.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((frec) => this.syncFrecuencyValidators(frec as FrecuencyEnum));
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

  /**
   * Sets or clears validators based on whether the fee is recurrent.
   */
  private syncRecurrenceState(type: FeeScheduleTypeEnum | null): void {
    const isRec = type === FeeScheduleTypeEnum.RECURRENT;
    const freqControl = this.form.controls.frecuency;

    if (isRec) {
      freqControl.setValidators([Validators.required]);
      freqControl.setValue(FrecuencyEnum.WEEKLY);
    } else {
      freqControl.clearValidators();
      this.resetRecurrenceFields();
    }
    this.form.updateValueAndValidity();
  }

  /**
   * Adjusts specific validators based on the frequency (Weekly vs Monthly).
   */
  private syncFrecuencyValidators(
    frec: FrecuencyEnum | null | undefined,
  ): void {
    const dow = this.form.controls.dayOfWeek;
    const dom = this.form.controls.dayOfMonth;

    dow.clearValidators();
    dom.clearValidators();

    if (frec === FrecuencyEnum.WEEKLY) {
      dow.setValidators([Validators.required]);
      dow.setValue(new Date().getDay());
      dom.setValue(undefined);
    } else if (frec === FrecuencyEnum.MONTHLY) {
      dom.setValidators([Validators.required]);
      dom.setValue(1);
      dow.setValue(undefined);
    }

    dow.updateValueAndValidity();
    dom.updateValueAndValidity();
  }

  private resetRecurrenceFields(): void {
    this.form.patchValue({
      frecuency: undefined,
      dayOfWeek: undefined,
      dayOfMonth: undefined,
      endDate: undefined,
    });
  }
}
