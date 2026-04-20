import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-cash-summary',
  imports: [Card],
  templateUrl: './cash-summary.html',
  styleUrl: './cash-summary.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashSummary {}
