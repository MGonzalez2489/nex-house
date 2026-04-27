import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-fee-schedule-list',
  imports: [],
  templateUrl: './fee-schedule-list.html',
  styleUrl: './fee-schedule-list.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeScheduleList {}
