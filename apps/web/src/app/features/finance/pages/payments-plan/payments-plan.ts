import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FeeScheduleDetails,
  FeeScheduleForm,
  FeeScheduleInit,
  FeeScheduleList,
  FeeScheduleTable,
} from '@features/finance/components';
import { FinanceStore } from '@features/finance/stores';
import { FeeScheduleModel } from '@nex-house/models';
import { PageHeader } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';

type drawerConfiguration = {
  component: 'FORM' | 'DETAILS';
  header: string;
};

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
    FeeScheduleDetails,
  ],
  templateUrl: './payments-plan.html',
  styleUrl: './payments-plan.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsPlan {
  protected readonly store = inject(FinanceStore);

  isDrawerOpen = signal<boolean>(false);
  drawerConfig = signal<drawerConfiguration | undefined>(undefined);
  selected = signal<FeeScheduleModel | undefined>(undefined);

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }

  openForm(): void {
    this.drawerConfig.set({
      component: 'FORM',
      header: 'Configurar Cobro',
    });
    this.isDrawerOpen.set(true);
  }
  openDetails(fee: FeeScheduleModel): void {
    this.drawerConfig.set({
      component: 'DETAILS',
      header: 'Detalles del Cobro',
    });
    this.selected.set(fee);
    this.isDrawerOpen.set(true);
  }
}
