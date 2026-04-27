import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FeeScheduleTypeEnum } from '@nex-house/enums';
import { FeeScheduleModel } from '@nex-house/models';
import { CronToHumanPipe } from '@shared/pipes';
import { CronInterpreter } from '@shared/utils';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-fee-schedule-details',
  imports: [
    CurrencyPipe,
    DatePipe,
    CronToHumanPipe,
    ProgressBarModule,
    ButtonModule,
  ],
  templateUrl: './fee-schedule-details.html',
  styleUrl: './fee-schedule-details.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeScheduleDetails {
  record = input<FeeScheduleModel>();

  isRecurrent = computed(
    () => this.record()?.type === FeeScheduleTypeEnum.RECURRENT,
  );
  nextOcurrences = computed<Date[]>(() => {
    const cRecord = this.record();
    if (!cRecord) return [];

    return CronInterpreter.getNextOccurrences(cRecord.cronSchedule);
  });
  paidCount = computed(() => {
    const cRecord = this.record();

    if (!cRecord) return 0;

    return cRecord.totalCollected / cRecord.amount;
  });
}
