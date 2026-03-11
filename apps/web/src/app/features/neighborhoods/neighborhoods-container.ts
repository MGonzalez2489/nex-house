import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageHeader } from '@shared/components/ui';
import {
  NeighborhoodsForm,
  NeighborhoodsStats,
  NeighborhoodsTable,
} from './components';

import { Search } from '@nex-house/interfaces';
import { NeighborhoodStore } from '@stores/neighborhood.store';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-neighborhoods-container',
  imports: [NeighborhoodsStats, NeighborhoodsTable, PageHeader, ButtonModule],
  templateUrl: './neighborhoods-container.html',
  styleUrl: './neighborhoods-container.css',
  standalone: true,
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeighborhoodsContainer {
  protected readonly store = inject(NeighborhoodStore);
  protected readonly dialogService = inject(DialogService);

  addNeighborhoods() {
    this.dialogService.open(NeighborhoodsForm, {});
  }

  search(filters: Search): void {
    this.store.loadAll(filters);
  }
}
