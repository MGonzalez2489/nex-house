import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ModalService } from '@core/services';
import {
  ChargesApproval,
  ChargesCancel,
  ChargesDetails,
  ChargesFilters,
  ChargesSummary,
  ChargesTable,
} from '@features/finance/components';
import { FinanceStore } from '@features/finance/stores';
import { ChargeStatusEnum } from '@nex-house/enums';
import { SearchCharges } from '@nex-house/interfaces';
import { ChargeModel } from '@nex-house/models';
import { PageHeader } from '@shared/components/ui';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-payments-monitor',
  imports: [Card, ChargesTable, ChargesFilters, PageHeader, ChargesSummary],
  templateUrl: './payments-monitor.html',
  styleUrl: './payments-monitor.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsMonitor implements OnInit {
  protected readonly store = inject(FinanceStore);
  protected readonly modalService = inject(ModalService);
  protected readonly filters = signal<SearchCharges>({
    filterDate: 'this_month',
    first: 0,
    rows: 50,
  });

  constructor() {
    effect(() => {
      const cFilters = this.filters();
      this.store.chargesLoadAll(cFilters);
    });

    effect(() => {
      const allCharges = this.store.chargesEntities();
      if (allCharges.length === 0) return;

      const c = allCharges.filter((f) => f.status !== ChargeStatusEnum.PENDING);

      this.view(c[0]);
    });
  }

  ngOnInit(): void {
    this.filters.set(this.filters());
    this.store.chargesLoadSummary(this.filters());
  }

  search(filters: SearchCharges): void {
    this.filters.set(filters);
  }
  async confirm(charge: ChargeModel) {
    this.modalService.open(ChargesApproval, {
      header: 'Confirmar Recepción de Pago',
      width: '480px',
      inputValues: {
        charge,
      },
    });
  }
  async cancelCharge(charge: ChargeModel) {
    this.modalService.open(ChargesCancel, {
      header: 'Anular Cargo Pendiente',
      width: '480px',
      inputValues: {
        charge,
      },
    });
  }
  view(charge: ChargeModel) {
    this.modalService.open(ChargesDetails, {
      header: 'Detalles del Cargo',
      width: '480px',
      inputValues: {
        charge,
      },
    });
  }
}
