import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FinanceStore } from '@features/finance/stores';
import { TransactionTypeEnum } from '@nex-house/enums';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

type MovementForm = {
  type: FormControl<string>;
  title: FormControl<string>;
  description: FormControl<string>;
  amount: FormControl<number>;
  // category: FormControl<string>;
  transactionDate: FormControl<string>;
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
    InputNumberModule,
  ],
  templateUrl: './cash-form.html',
  styleUrl: './cash-form.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashForm implements OnInit {
  protected readonly movementOptions = [
    { key: 'Ingreso', value: TransactionTypeEnum.INCOME },
    { key: 'Gasto', value: TransactionTypeEnum.EXPENSE },
  ];
  protected readonly form = new FormGroup<MovementForm>({
    type: new FormControl(TransactionTypeEnum.INCOME, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    title: new FormControl('', {
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
    transactionDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    evidenceUrl: new FormControl('', {
      nonNullable: true,
    }),
  });
  private readonly ref = inject(DynamicDialogRef);
  protected readonly store = inject(FinanceStore);

  ngOnInit(): void {
    const today = new Date();
    const tString = `${today.getMonth()}/${today.getDay()}/${today.getFullYear()}`;
    this.form.patchValue({ transactionDate: tString });
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      sourceType: 'expense',
      transactionDate: new Date(raw.transactionDate).toISOString(),
    };

    const success = await this.store.TransactionCreate(payload);
    if (success) {
      this.ref.close();
    }
  }
}
