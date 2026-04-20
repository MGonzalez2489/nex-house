import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TransactionTypeEnum } from '@nex-house/enums';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';

type MovementForm = {
  type: FormControl<string>;
  description: FormControl<string>;
  amount: FormControl<number>;
  // category: FormControl<string>;
  date: FormControl<string>;
  evidenceUrl: FormControl<string>;
};

@Component({
  selector: 'app-cash-form',
  imports: [
    InputTextModule,
    SelectModule,
    DatePickerModule,
    SelectButtonModule,
    FormValidationError,
    FormOptions,
    ReactiveFormsModule,
    TextareaModule,
    JsonPipe,
  ],
  templateUrl: './cash-form.html',
  styleUrl: './cash-form.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashForm {
  protected readonly movementOptions = [
    { key: 'Ingreso', value: TransactionTypeEnum.INCOME },
    { key: 'Gasto', value: TransactionTypeEnum.EXPENSE },
  ];
  protected readonly form = new FormGroup<MovementForm>({
    type: new FormControl(TransactionTypeEnum.INCOME, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    // category: new FormControl('', {
    //   nonNullable: true,
    //   validators: [Validators.required],
    // }),
    date: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    evidenceUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
  }
}
