import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FeeScheduleForm,
  FeeScheduleInit,
  FeeScheduleList,
  FeeScheduleTable,
} from '@features/finance/components';
import { FinanceStore } from '@features/finance/stores';
import { PageHeader } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-payments-plan',
  imports: [
    PageHeader,
    ButtonModule,
    FeeScheduleTable,
    FeeScheduleList,
    DrawerModule,
    FeeScheduleForm,
    Card,
    FeeScheduleInit,
  ],
  templateUrl: './payments-plan.html',
  styleUrl: './payments-plan.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsPlan {
  protected readonly store = inject(FinanceStore);
  isFormVisible = true;

  async save() {
    this.isFormVisible = false;
  }
}
