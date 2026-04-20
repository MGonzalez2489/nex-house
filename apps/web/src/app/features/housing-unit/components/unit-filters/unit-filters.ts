import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { Search } from '@nex-house/interfaces';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-unit-filters',
  imports: [InputTextModule],
  templateUrl: './unit-filters.html',
  styleUrl: './unit-filters.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitFilters {
  filter = output<Search>();

  // search(event: TableLazyLoadEvent): void {
  //   const searchParams: Search = {
  //     first: event.first ?? 0,
  //     rows: event.rows ?? 10,
  //     sortField: (event.sortField as string) ?? 'createdAt',
  //     sortOrder: event.sortOrder ?? -1,
  //     globalFilter: (event.globalFilter as string) ?? '',
  //   };
  //
  //   this.filter.emit(searchParams);
  // }
}
