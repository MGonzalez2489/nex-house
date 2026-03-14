import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ApiPaginationMeta } from '@nex-house/interfaces';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { Table as PTable } from 'primeng/table';

export interface TableColumn<T> {
  field: keyof T & string;
  header: string;
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'app-table',
  imports: [
    TableModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    NgTemplateOutlet,
    TagModule,
  ],
  templateUrl: './table.html',
  styleUrl: './table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table<T> {
  // Inputs con Signals
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  isLoading = input.required<boolean>();
  pagination = input<ApiPaginationMeta>();
  showActions = input<boolean>(true);
  lazy = input<boolean>(false);
  loadOnInit = input<boolean>(false);

  //outputs
  filter = output<TableLazyLoadEvent>();

  // Consultamos templates hijos (Signal Queries)
  bodyTemplate = contentChild<TemplateRef<any>>('body');
  actionsTemplate = contentChild<TemplateRef<any>>('actions');
  captionTemplate = contentChild<TemplateRef<any>>('caption');

  private table = viewChild.required<PTable>('dt');
  public filterGlobal(value: string, mode = 'contains') {
    this.table().filterGlobal(value, mode);
  }
}
