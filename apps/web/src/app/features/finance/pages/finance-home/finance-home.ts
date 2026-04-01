import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FeeScheduleForm,
  FeeScheduleTable,
} from '@features/finance/components';
import { FinanceStore } from '@features/finance/stores';
import { PageHeader } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-finance-home',
  imports: [
    PageHeader,
    ButtonModule,
    FeeScheduleTable,
    DrawerModule,
    FeeScheduleForm,
    Card,
  ],
  templateUrl: './finance-home.html',
  styleUrl: './finance-home.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceHome {
  protected readonly store = inject(FinanceStore);
  isFormVisible = false;

  async save() {
    this.isFormVisible = false;
  }
}
