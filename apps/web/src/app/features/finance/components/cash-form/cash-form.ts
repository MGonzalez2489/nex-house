import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
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
import { TransactionModel } from '@nex-house/models';

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
      validators: [Validators.required],
    }),
    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    transactionDate: new FormControl(new Date(), {
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

  existing = input<TransactionModel>();

  selectedFile: File | null = null;

  selTypeChanges = toSignal(this.form.controls.type.valueChanges);
  selType = computed(() => {
    const selType = this.selTypeChanges();
    if (!selType) return TransactionTypeEnum.INCOME;

    return selType as TransactionTypeEnum;
  });

  ngOnInit(): void {
    const ex = this.existing();

    if (ex) {
      this.form.patchValue({
        type: ex.type,
        title: ex.title,
        description: ex.description,
        amount: ex.amount,
        category: ex.category.publicId,
        transactionDate: new Date(ex.transactionDate),
        evidence: ex.evidence?.fileName,
      });
    }
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

    // const raw = this.form.getRawValue();
    // const formData = new FormData();
    //
    // // Mapear campos al FormData
    // formData.append('type', raw.type);
    // formData.append('amount', raw.amount.toString());
    // formData.append('title', raw.title);
    // formData.append('description', raw.description);
    // formData.append('sourceType', 'expense');
    // formData.append('category', raw.category);
    // formData.append('transactionDate', raw.transactionDate.toISOString());
    //
    // // Adjuntar el archivo físico si existe
    // if (this.selectedFile) {
    //   formData.append('evidence', this.selectedFile);
    // }

    const ex = this.existing();
    const formData = ex ? this.updatePayload() : this.createPayload();
    // IMPORTANTE: Tu API debe recibir 'formData' en lugar del objeto plano
    const success = ex
      ? await this.store.TransactionUpdate(ex.publicId, formData)
      : await this.store.TransactionCreate(formData);
    if (success) {
      this.ref.close();
    }
  }
  doCancel() {
    this.ref.close();
  }

  private createPayload() {
    const raw = this.form.getRawValue();
    const formData = new FormData();

    // Mapear campos al FormData
    formData.append('type', raw.type);
    formData.append('amount', raw.amount.toString());
    formData.append('title', raw.title);
    formData.append('description', raw.description);
    formData.append('sourceType', 'expense');
    formData.append('category', raw.category);
    formData.append('transactionDate', raw.transactionDate.toISOString());

    // Adjuntar el archivo físico si existe
    if (this.selectedFile) {
      formData.append('evidence', this.selectedFile);
    }

    return formData;
  }
  private updatePayload(): FormData {
    const raw = this.form.getRawValue();
    const formData = new FormData();
    const ex = this.existing();

    if (!ex) return formData;

    // 1. Mapeo de comparaciones simples (valor directo)
    const simpleFields: (keyof typeof raw & keyof TransactionModel)[] = [
      'type',
      'amount',
      'title',
      'description',
    ];

    simpleFields.forEach((field) => {
      if (raw[field] !== undefined && (ex[field] as any) !== raw[field]) {
        formData.append(field, raw[field].toString());
      }
    });

    // 2. Lógica para la categoría (propiedad anidada)
    if (raw.category && ex.category?.publicId !== raw.category) {
      formData.append('category', raw.category);
    }

    // 3. Lógica para la fecha (comparación de tiempo)
    if (raw.transactionDate) {
      const exDate = new Date(ex.transactionDate).getTime();
      const rawDate = new Date(raw.transactionDate).getTime();

      if (exDate !== rawDate) {
        formData.append('transactionDate', raw.transactionDate.toISOString());
      }
    }

    // 4. Lógica para el archivo (evidencia)
    if (this.selectedFile && this.selectedFile.name !== ex.evidence?.fileName) {
      formData.append('evidence', this.selectedFile);
    }

    return formData;
  }
}
