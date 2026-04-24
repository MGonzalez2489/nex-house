import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { TransactionModel } from '@nex-house/models';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-cash-movement',
  imports: [Card, CurrencyPipe, ButtonModule],
  templateUrl: './cash-movement.html',
  styleUrl: './cash-movement.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashMovement {
  transaction = input.required<TransactionModel>();

  // TODO: implement this
  actions = signal<MenuItem[]>([
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      // command: (e) => edit(e)
    },
    {
      label: 'Descargar PDF',
      icon: 'pi pi-file-pdf',
      // command: (e) => download(e),
    },
    { separator: true },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      color: 'text-red-500',
      // command: (e) => confirmDelete(e),
    },
  ]);

  viewEvidence() {
    const url = this.transaction()?.evidenceUrl;

    if (!url) return;

    window.open(`public/${url}`, '_blank');
  }
}
