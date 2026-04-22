import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { SearchTransaction } from '@nex-house/interfaces';
import { PrimeIcons } from 'primeng/api';
import { ChipModule } from 'primeng/chip';

type FilterChip = {
  key: string;
  label: string;
  value: string;
  permanent: boolean;
  icon?: string;
};

@Component({
  selector: 'app-cash-filters-chips',
  imports: [ChipModule],
  templateUrl: './cash-filters-chips.html',
  styleUrl: './cash-filters-chips.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class CashFiltersChips {
  private readonly dPipe = inject(DatePipe);
  filters = input<SearchTransaction>();
  removeFilter = output<string>();
  chips = computed<FilterChip[]>(() => {
    const cFilters = this.filters();
    const c: FilterChip[] = [];
    if (!cFilters) return c;

    //dates
    if (cFilters.month && cFilters.year) {
      const d = new Date(cFilters.year, cFilters.month);
      const dString =
        this.dPipe.transform(d, 'MMMM yyyy') || new Date().toDateString();
      c.push({
        key: 'date',
        label: dString, //'Fecha',
        value: `${cFilters.month}/${cFilters.year}`,
        icon: PrimeIcons.CALENDAR,
        permanent: true,
      });
    }

    //Description
    if (cFilters.globalFilter) {
      c.push({
        key: 'globalFilter',
        // label: 'Descripcion',
        label: `Descripcion : ${cFilters.globalFilter}`,
        value: cFilters.globalFilter,
        icon: PrimeIcons.FILE,
        permanent: false,
      });
    }

    return c;
  });

  remove(c: FilterChip) {
    this.removeFilter.emit(c.key);
  }
}
