import {
  ChangeDetectionStrategy,
  Component,
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

import { toSignal } from '@angular/core/rxjs-interop';
import { TransactionModel } from '@nex-house/models';
import { TransactionCategorySelect } from '@shared/components/smart';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { FileSizePipe } from '@shared/pipes';

type MovementForm = {
  type: FormControl<string>;
  title: FormControl<string>;
  description: FormControl<string>;
  amount: FormControl<number>;
  transactionDate: FormControl<Date>;
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
    ButtonModule,
    FileSizePipe,
  ],
  templateUrl: './cash-form.html',
  styleUrl: './cash-form.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashForm {
  // Services
  private readonly ref = inject(DynamicDialogRef);
  protected readonly store = inject(FinanceStore);
  protected readonly catStore = inject(CatalogsStore);

  // Inputs & Signals
  existing = input<TransactionModel>();
  selectedFile = signal<File | null>(null);

  // Form definition
  protected readonly form = new FormGroup<MovementForm>({
    type: new FormControl(TransactionTypeEnum.EXPENSE, {
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
      validators: [Validators.required, Validators.min(0.01)],
    }),
    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    transactionDate: new FormControl(new Date(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    evidence: new FormControl('', { nonNullable: true }),
  });

  // Reactive State
  protected readonly movementOptions = [
    { key: 'Ingreso', value: TransactionTypeEnum.INCOME },
    { key: 'Gasto', value: TransactionTypeEnum.EXPENSE },
  ];

  selType = toSignal(this.form.controls.type.valueChanges, {
    initialValue: TransactionTypeEnum.EXPENSE,
  });

  constructor() {
    // Reemplaza ngOnInit para inicializar datos cuando el input 'existing' cambie
    effect(() => {
      const ex = this.existing();
      if (ex) {
        this.form.patchValue({
          type: ex.type as TransactionTypeEnum,
          title: ex.title,
          description: ex.description,
          amount: ex.amount,
          category: ex.category?.publicId,
          transactionDate: new Date(ex.transactionDate),
          evidence: ex.evidence?.fileName,
        });
      }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile.set(null);
    // Opcional: Resetear el input file real si se usa ViewChild
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const ex = this.existing();
    const formData = this.preparePayload(ex);

    const success = ex
      ? await this.store.TransactionUpdate(ex.publicId, formData)
      : await this.store.TransactionCreate(formData);

    if (success) this.ref.close(true);
  }

  private preparePayload(ex?: TransactionModel): FormData {
    const raw = this.form.getRawValue();
    const formData = new FormData();
    const file = this.selectedFile();

    // Helper para añadir solo si cambió o si es nuevo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appendIfChanged = (key: string, value: any, original?: any) => {
      if (!ex || value !== original) {
        formData.append(
          key,
          value instanceof Date ? value.toISOString() : String(value),
        );
      }
    };

    appendIfChanged('type', raw.type, ex?.type);
    appendIfChanged('title', raw.title, ex?.title);
    appendIfChanged('description', raw.description, ex?.description);
    appendIfChanged('amount', raw.amount, ex?.amount);
    appendIfChanged('category', raw.category, ex?.category?.publicId);

    // Fecha: comparamos timestamps
    if (
      !ex ||
      new Date(raw.transactionDate).getTime() !==
        new Date(ex.transactionDate).getTime()
    ) {
      formData.append('transactionDate', raw.transactionDate.toISOString());
    }

    if (!ex) formData.append('sourceType', 'expense');

    // Evidencia
    if (file) {
      formData.append('evidence', file);
    }

    return formData;
  }

  doCancel() {
    this.ref.close();
  }
}
