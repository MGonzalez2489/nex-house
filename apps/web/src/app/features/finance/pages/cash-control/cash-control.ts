import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { ModalService } from '@core/services';
import {
  CashFilters,
  CashForm,
  CashMovementList,
  CashSummary,
} from '@features/finance/components';
import { PageHeader } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cash-control',
  imports: [
    PageHeader,
    ButtonModule,
    CashSummary,
    CashFilters,
    CashForm,
    CashMovementList,
  ],
  templateUrl: './cash-control.html',
  styleUrl: './cash-control.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashControl implements OnInit {
  protected readonly modalService = inject(ModalService);

  ngOnInit(): void {
    this.addMovement();
  }

  addMovement(): void {
    this.modalService.open(CashForm, { header: 'Registrar Movimiento' });
  }
}
