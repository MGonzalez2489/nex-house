import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-cash-filters',
  imports: [
    Card,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    ButtonModule,
  ],
  templateUrl: './cash-filters.html',
  styleUrl: './cash-filters.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashFilters {}
