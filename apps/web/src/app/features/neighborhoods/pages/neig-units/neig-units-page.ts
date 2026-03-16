import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ModalService } from '@core/services';
import { Search } from '@nex-house/interfaces';
import { UnitsTable } from '@shared/components/data';
import { UnitForm } from '@shared/components/forms';
import { UnitsStore } from '@stores/units.store';

@Component({
  selector: 'app-neig-units-page',
  imports: [UnitsTable],
  templateUrl: './neig-units-page.html',
  styleUrl: './neig-units-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeigUnitsPage {
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
