import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  NeighborhoodsForm,
  NeighborhoodsStats,
  NeighborhoodsTable,
} from '@features/neighborhoods/components';
import { Search } from '@nex-house/interfaces';
import { PageHeader } from '@shared/components/ui';
import { NeighborhoodStore } from '@stores/neighborhood.store';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-neighborhood-home-page',
  imports: [PageHeader, NeighborhoodsStats, NeighborhoodsTable, ButtonModule],
  templateUrl: './neighborhood-home-page.html',
  styleUrl: './neighborhood-home-page.css',
  standalone: true,
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeighborhoodHomePage {
  protected readonly store = inject(NeighborhoodStore);
  protected readonly dialogService = inject(DialogService);

  addNeighborhoods() {
    this.dialogService.open(NeighborhoodsForm, {});
  }

  search(filters: Search): void {
    this.store.loadAll(filters);
  }
}
