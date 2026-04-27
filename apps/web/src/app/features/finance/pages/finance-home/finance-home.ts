import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-finance-home',
  imports: [],
  templateUrl: './finance-home.html',
  styleUrl: './finance-home.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceHome {}
