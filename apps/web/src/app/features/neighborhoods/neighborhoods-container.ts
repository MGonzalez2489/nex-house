import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '@shared/components/ui';
import {
  NeighborhoodsFilters,
  NeighborhoodsStats,
  NeighborhoodsTable,
} from './components';

import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-neighborhoods-container',
  imports: [
    NeighborhoodsStats,
    NeighborhoodsFilters,
    NeighborhoodsTable,
    PageHeader,
  ],
  templateUrl: './neighborhoods-container.html',
  styleUrl: './neighborhoods-container.css',

  standalone: true,
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeighborhoodsContainer {}
