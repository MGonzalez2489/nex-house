import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-fee-schedule-init',
  imports: [ButtonModule],
  templateUrl: './fee-schedule-init.html',
  styleUrl: './fee-schedule-init.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeScheduleInit {
  addCharge = output();
}
