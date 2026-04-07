import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { ChargeStatusEnum } from '@nex-house/enums';
import { ApiPaginationMeta, Search } from '@nex-house/interfaces';
import { ChargeModel } from '@nex-house/models';
import { Table, TableColumn } from '@shared/components/data';
import { UserAvatar } from '@shared/components/ui';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TableLazyLoadEvent } from 'primeng/table';
import { ChargeStatusTag } from '../charge-status-tag/charge-status-tag';

@Component({
  selector: 'app-charges-table',
  imports: [
    ButtonModule,
    UserAvatar,
    Table,
    CurrencyPipe,
    DatePipe,
    ChargeStatusTag,
    MenuModule,
  ],
  templateUrl: './charges-table.html',
  styleUrl: './charges-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargesTable {
  data = input.required<ChargeModel[]>();
  isLoading = input.required<boolean>();
  pagination = input<ApiPaginationMeta>();

  filter = output<Search>();
  confirm = output<ChargeModel>();
  cancelCharge = output<ChargeModel>();
  view = output<ChargeModel>();

  selected = signal<ChargeModel | undefined>(undefined);

  private availableItems: MenuItem[] = [
    {
      id: 'viewBtn',
      label: 'Ver',
      icon: 'pi pi-search',
      command: () => {
        const s = this.selected();
        if (s) {
          this.view.emit(s);
        }
      },
    },
    {
      id: 'approveBtn',
      label: 'Aprobar',
      icon: 'pi pi-check',
      command: () => {
        const s = this.selected();
        if (s) {
          this.confirm.emit(s);
        }
      },
    },
    {
      id: 'cancelBtn',
      label: 'Cancelar',
      icon: 'pi pi-ban',
      command: () => {
        const s = this.selected();
        if (s) {
          this.cancelCharge.emit(s);
        }
      },
    },
  ];
  items = signal<MenuItem[]>([]);

  constructor() {
    effect(() => {
      const cSelected = this.selected();
      if (!cSelected) return;

      let rOptions: string[] = [];
      if (cSelected.status === ChargeStatusEnum.PENDING) {
        rOptions = ['approveBtn', 'cancelBtn'];
      }
      if (cSelected.status !== ChargeStatusEnum.PENDING) {
        rOptions = ['viewBtn'];
      }

      this.items.set(
        this.availableItems.filter((f) => rOptions.some((g) => g === f.id)),
      );
    });
  }

  cols: TableColumn<ChargeModel>[] = [
    { field: 'issuedToUser', header: 'Residente' },
    { field: 'unit', header: 'Unidad' },
    { field: 'description', header: 'Concepto' },
    { field: 'amount', header: 'Monto' },
    { field: 'dueDate', header: 'Fecha limite' },
    { field: 'status', header: 'Estatus' },
  ];
  search(event: TableLazyLoadEvent): void {
    const searchParams: Search = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
    };

    this.filter.emit(searchParams);
  }
}
