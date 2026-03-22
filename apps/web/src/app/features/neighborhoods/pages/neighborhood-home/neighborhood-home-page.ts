import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ModalService } from '@core/services';
import {
  NeighborhoodsForm,
  NeighborhoodsStats,
  NeighborhoodsTable,
} from '@features/neighborhoods/components';
import { Search } from '@nex-house/interfaces';
import { PageHeader } from '@shared/components/ui';
import { NeighborhoodsStore } from '@stores/neighborhoods.store';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-neighborhood-home-page',
  imports: [PageHeader, NeighborhoodsStats, NeighborhoodsTable, ButtonModule],
  templateUrl: './neighborhood-home-page.html',
  styleUrl: './neighborhood-home-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeighborhoodHomePage {
  protected readonly store = inject(NeighborhoodsStore);
  protected readonly modalService = inject(ModalService);

  addNeighborhoods() {
    this.modalService.open(NeighborhoodsForm, {
      width: '30vw',
      header: 'Registrar Fraccionamiento',
    });
  }

  search(filters: Search): void {
    this.store.loadAll(filters);
  }
}
