import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { FeeScheduleTypeEnum } from '@nex-house/enums';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { SelectButtonModule } from 'primeng/selectbutton';
import { ICreateFeeSchedule } from '@nex-house/interfaces';
import { toSignal } from '@angular/core/rxjs-interop';

type CreateFeeScheduleForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  amount: FormControl<number>;
  type: FormControl<string>;
  // status: FormControl<string | undefined>;
  startDate: FormControl<string | undefined>;
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
    // status: new FormControl(undefined, { nonNullable: true }),
    startDate: new FormControl(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    endDate: new FormControl(undefined, { nonNullable: true }),
  });
  protected readonly store = inject(FinanceStore);
  protected readonly types = [
    { key: 'Recurrente', value: FeeScheduleTypeEnum.RECURRENT },
    { key: 'Unico', value: FeeScheduleTypeEnum.ONE_TIME },
  ];
  protected readonly save = output();

  private readonly changes = toSignal(this.form.valueChanges);
  protected readonly isRecurrent = computed(() => {
    const cChanges = this.changes();
    if (!cChanges?.type) return false;

    return cChanges.type === FeeScheduleTypeEnum.RECURRENT;
  });

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const success = await this.store.feeScheduleCreate(
      raw as ICreateFeeSchedule,
    );
    if (success) {
      this.save.emit();
    }
  }

  doCancel(): void {
    this.form.reset();

    this.save.emit();
  }
}
