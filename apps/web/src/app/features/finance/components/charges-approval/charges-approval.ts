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
import { ChargeConfirmModel, ChargeModel } from '@nex-house/models';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { TextareaModule } from 'primeng/textarea';

type ApproveChargeForm = {
  paymentDate: FormControl<string>;
  approvalNotes: FormControl<string>;
  evidenceUrl: FormControl<string | undefined>;
};

@Component({
  selector: 'app-charges-approval',
  imports: [
    CurrencyPipe,
    DatePickerModule,
    TextareaModule,
    ButtonModule,
    ReactiveFormsModule,
    FormOptions,
    FormValidationError,
  ],
  templateUrl: './charges-approval.html',
  styleUrl: './charges-approval.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargesApproval {
  charge = input.required<ChargeModel>();
  private readonly ref = inject(DynamicDialogRef);
  protected readonly store = inject(FinanceStore);
  protected readonly form = new FormGroup<ApproveChargeForm>({
    paymentDate: new FormControl(new Date().toLocaleDateString(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    approvalNotes: new FormControl('', {
      nonNullable: true,
    }),
    evidenceUrl: new FormControl(undefined, {
      nonNullable: true,
    }),
  });

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto = this.form.value as ChargeConfirmModel;

    const res = await this.store.confirm(this.charge().publicId, dto);
    if (res) {
      this.ref.close();
    }
  }

  doCancel() {
    this.ref.close();
  }
}
