import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChargeStatusEnum, DateOptionsFilterEnum } from '@nex-house/enums';
import { KeyValueItem, SearchCharges } from '@nex-house/interfaces';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

interface ISearchCharge {
  globalFilter: FormControl<string>;
  status: FormControl<string>;
  filterDate: FormControl<string>;
  from: FormControl<string | null>;
  to: FormControl<string | null>;
}

@Component({
  selector: 'app-charges-filters',
  imports: [
    InputTextModule,
    SelectModule,
    ButtonModule,
    ReactiveFormsModule,
    DatePickerModule,
  ],
  templateUrl: './charges-filters.html',
  styleUrl: './charges-filters.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargesFilters {
  filter = output<SearchCharges>();
  status = signal<KeyValueItem[]>([
    { key: 'Todos los status', value: '' },
    { key: 'Pagado', value: ChargeStatusEnum.PAID.toString() },
    { key: 'Cancelado', value: ChargeStatusEnum.CANCELLED.toString() },
    { key: 'Pendiente', value: ChargeStatusEnum.PENDING.toString() },
    // { key: 'Parcial', value: ChargeStatusEnum.PARTIAL.toString() },
  ]);
  dateFilters = signal<KeyValueItem[]>([
    { key: 'Este mes', value: DateOptionsFilterEnum.THIS_MONTH },
    { key: 'El mes pasado', value: DateOptionsFilterEnum.LAST_MONTH },
    { key: 'Custom', value: DateOptionsFilterEnum.CUSTOM },
  ]);

  form = new FormGroup<ISearchCharge>({
    globalFilter: new FormControl('', {
      nonNullable: true,
    }),
    status: new FormControl('', {
      nonNullable: true,
    }),
    filterDate: new FormControl(DateOptionsFilterEnum.THIS_MONTH, {
      nonNullable: true,
    }),
    from: new FormControl(null),
    to: new FormControl(null),
  });

  search() {
    const v = this.form.value as SearchCharges;
    v.from = v.from ? new Date(v.from[0]).toISOString() : v.from;
    v.to = v.from ? new Date(v.from[1]).toISOString() : v.to;
    this.filter.emit(v);
  }

  protected setDateThisMonth() {
    this.form.patchValue({
      filterDate: DateOptionsFilterEnum.THIS_MONTH,
      from: null,
      to: null,
    });
  }
  protected setDateLastMonth() {
    this.form.patchValue({
      filterDate: DateOptionsFilterEnum.LAST_MONTH,
      from: null,
      to: null,
    });
  }
}
