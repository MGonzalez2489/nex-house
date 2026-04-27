import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ChargeSummaryModel } from '@nex-house/models';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-charges-summary',
  imports: [Card, CurrencyPipe, PercentPipe],
  templateUrl: './charges-summary.html',
  styleUrl: './charges-summary.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargesSummary {
  summary = input.required<ChargeSummaryModel>();
}
