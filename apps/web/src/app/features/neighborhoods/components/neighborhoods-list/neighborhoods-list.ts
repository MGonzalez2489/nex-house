import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiPaginationMeta } from '@nex-house/interfaces';
import { NeighborhoodModel } from '@nex-house/models';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-neighborhoods-list',
  imports: [Card, RouterLink],
  templateUrl: './neighborhoods-list.html',
  styleUrl: './neighborhoods-list.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeighborhoodsList {
  data = input.required<NeighborhoodModel[]>();
  isLoading = input.required<boolean>();
  pagination = input<ApiPaginationMeta>();
}
