import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cash-movement',
  imports: [],
  templateUrl: './cash-movement.html',
  styleUrl: './cash-movement.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashMovement {}
