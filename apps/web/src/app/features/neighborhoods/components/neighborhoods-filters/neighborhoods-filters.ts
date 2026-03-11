import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-neighborhoods-filters',
  imports: [Card, InputTextModule, ButtonModule],
  templateUrl: './neighborhoods-filters.html',
  styleUrl: './neighborhoods-filters.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeighborhoodsFilters {}
