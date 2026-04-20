import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cash-movement-list',
  imports: [],
  templateUrl: './cash-movement-list.html',
  styleUrl: './cash-movement-list.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashMovementList {}
