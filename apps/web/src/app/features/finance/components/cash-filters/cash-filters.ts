import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FinanceStore } from '@features/finance/stores';
import { SearchTransaction } from '@nex-house/interfaces';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-cash-filters',
  imports: [
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    ButtonModule,
    DatePickerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './cash-filters.html',
  styleUrl: './cash-filters.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashFilters implements OnInit {
  readonly filters = input<SearchTransaction>();
  protected readonly doSearch = output<SearchTransaction>();
  protected readonly maxDate = new Date();
  protected readonly store = inject(FinanceStore);
  readonly initDate = input<string>();
  private readonly ref = inject(DynamicDialogRef);

  formatedInitDate = computed(() => {
    const cInitDate = this.initDate();
    if (!cInitDate) {
      const today = new Date();
      today.setMonth(0);
      return today;
    }
    return new Date(cInitDate);
  });

  protected readonly form = new FormGroup({
    hint: new FormControl('', { nonNullable: true }),
    category: new FormControl('', { nonNullable: true }),
    date: new FormControl(new Date(), { nonNullable: true }),
  });

  ngOnInit(): void {
    const cFilters = this.filters();

    if (!cFilters) return;

    this.form.patchValue({
      hint: cFilters.globalFilter,
      date:
        cFilters.month && cFilters.year
          ? new Date(cFilters.year, cFilters.month)
          : new Date(),
    });
  }

  search() {
    const cFilters = Object.assign({}, this.filters());
    const { hint, date } = this.form.value;

    cFilters.globalFilter = hint ? hint : undefined;
    if (date) {
      cFilters.month = date.getMonth();
      cFilters.year = date.getFullYear();
    }

    this.store.transactionsLoadAll(cFilters);

    this.ref.close();
  }
  protected resetForm() {
    this.form.patchValue({
      hint: '',
      date: new Date(),
    });
    this.search();
  }
}
