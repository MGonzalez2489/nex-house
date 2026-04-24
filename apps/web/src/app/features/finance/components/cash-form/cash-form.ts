import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CatalogsStore, FinanceStore } from '@features/finance/stores';
import { TransactionTypeEnum } from '@nex-house/enums';
import { FormOptions, FormValidationError } from '@shared/components/ui';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';

import { FileUploadModule } from 'primeng/fileupload';
import { TransactionCategorySelect } from '@shared/components/smart';
import { toSignal } from '@angular/core/rxjs-interop';

type MovementForm = {
  type: FormControl<string>;
  title: FormControl<string>;
  description: FormControl<string>;
  amount: FormControl<number>;
  // category: FormControl<string>;
  transactionDate: FormControl<string>;
  evidence: FormControl<string>;
  category: FormControl<string>;
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
    InputNumberModule,
    FileUploadModule,
    TransactionCategorySelect,
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
    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    transactionDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    evidence: new FormControl('', {
      nonNullable: true,
    }),
  });
  private readonly ref = inject(DynamicDialogRef);
  protected readonly store = inject(FinanceStore);
  protected readonly catStore = inject(CatalogsStore);

  selectedFile: File | null = null;

  selTypeChanges = toSignal(this.form.controls.type.valueChanges);
  selType = computed(() => {
    const selType = this.selTypeChanges();
    if (!selType) return TransactionTypeEnum.INCOME;

    return selType as TransactionTypeEnum;
  });

  ngOnInit(): void {
    const today = new Date();
    const tString = `${today.getMonth()}/${today.getDay()}/${today.getFullYear()}`;
    this.form.patchValue({ transactionDate: tString });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const formData = new FormData();

    // Mapear campos al FormData
    formData.append('type', raw.type);
    formData.append('amount', raw.amount.toString());
    formData.append('title', raw.title);
    formData.append('description', raw.description);
    formData.append('sourceType', 'expense');
    formData.append('category', raw.category);
    formData.append(
      'transactionDate',
      new Date(raw.transactionDate).toISOString(),
    );

    // Adjuntar el archivo físico si existe
    if (this.selectedFile) {
      formData.append('evidence', this.selectedFile);
    }

    // IMPORTANTE: Tu API debe recibir 'formData' en lugar del objeto plano
    const success = await this.store.TransactionCreate(formData);
    if (success) {
      this.ref.close();
    }
  }
}
