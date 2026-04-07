import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FinanceStore } from '@features/finance/stores';
import { ChargeCancelModel, ChargeModel } from '@nex-house/models';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { TextareaModule } from 'primeng/textarea';

type CancelChargeForm = {
  cancelReason: FormControl<string>;
};

@Component({
  selector: 'app-charges-cancel',
  imports: [
    CurrencyPipe,
    ButtonModule,
    ReactiveFormsModule,
    TextareaModule,
    FormOptions,
    FormValidationError,
  ],
  templateUrl: './charges-cancel.html',
  styleUrl: './charges-cancel.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargesCancel {
  charge = input.required<ChargeModel>();

  private readonly ref = inject(DynamicDialogRef);
  protected readonly store = inject(FinanceStore);
  protected readonly form = new FormGroup<CancelChargeForm>({
    cancelReason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto = this.form.value as ChargeCancelModel;

    const res = await this.store.cancel(this.charge().publicId, dto);
    if (res) {
      this.ref.close();
    }
  }
  doCancel() {
    this.ref.close();
  }
}
