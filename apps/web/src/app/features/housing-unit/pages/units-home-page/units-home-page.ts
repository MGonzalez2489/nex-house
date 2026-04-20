import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ModalService } from '@core/services';
import { UnitsStore } from '@features/housing-unit';
import {
  UnitsTable,
  UnitForm,
  UnitFilters,
} from '@features/housing-unit/components';
import { Search } from '@nex-house/interfaces';
import { PageHeader } from '@shared/components/ui';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-units-home-page',
  imports: [Card, UnitsTable, PageHeader, UnitFilters],
  templateUrl: './units-home-page.html',
  styleUrl: './units-home-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsHomePage {
  protected readonly store = inject(UnitsStore);
  protected readonly modalService = inject(ModalService);

  search(value: Search) {
    this.store.loadAll(value);
  }

  addUnit() {
    this.modalService.open(UnitForm, {
      header: 'Crear Unidad',
      width: '35vw',
    });
  }
}
