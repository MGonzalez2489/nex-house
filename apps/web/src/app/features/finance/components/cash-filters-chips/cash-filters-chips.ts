import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { SearchTransaction } from "@nex-house/interfaces";
import { TransactionCategoryModel } from "@nex-house/models";
import { PrimeIcons } from "primeng/api";
import { ChipModule } from "primeng/chip";

type FilterChip = {
  key: string;
  label: string;
  value: string;
  permanent: boolean;
  icon?: string;
};

@Component({
  selector: "app-cash-filters-chips",
  imports: [ChipModule],
  templateUrl: "./cash-filters-chips.html",
  styleUrl: "./cash-filters-chips.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class CashFiltersChips {
  private readonly dPipe = inject(DatePipe);
  filters = input<SearchTransaction>();
  categories = input.required<TransactionCategoryModel[]>();
  removeFilter = output<string>();
  chips = computed<FilterChip[]>(() => {
    const cFilters = Object.assign({}, this.filters());
    const c: FilterChip[] = [];
    if (!cFilters) return c;

    //dates
    if (cFilters.month && cFilters.year) {
      const d = new Date(cFilters.year, cFilters.month - 1);
      const dString =
        this.dPipe.transform(d, "MMMM yyyy") || new Date().toDateString();
      c.push({
        key: "date",
        label: dString, //'Fecha',
        value: `${cFilters.month}/${cFilters.year}`,
        icon: PrimeIcons.CALENDAR,
        permanent: true,
      });
    }

    //Description
    if (cFilters.globalFilter) {
      c.push({
        key: "globalFilter",
        // label: 'Descripcion',
        label: `Descripcion : ${cFilters.globalFilter}`,
        value: cFilters.globalFilter,
        icon: PrimeIcons.FILE,
        permanent: false,
      });
    }

    if (cFilters.category) {
      const cat = this.categories().find(
        (f) => f.publicId === cFilters.category,
      );
      c.push({
        key: "category",
        label: `Categoria: ${cat?.name}`,
        value: cFilters.category,
        icon: PrimeIcons.TAG,
        permanent: false,
      });
    }

    return c;
  });

  remove(c: FilterChip) {
    this.removeFilter.emit(c.key);
  }
}
