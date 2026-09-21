import {ChangeDetectionStrategy, Component, computed, input, OnInit, output} from '@angular/core';
import {ApiPaginationMeta, SearchUser} from '@nexhouse/shared-domain/interfaces';
import {BaseCatalogModel, UserModel} from '@nexhouse/shared-domain/models';
import {AvatarComponent} from '@shared/components';
import {Button} from '@openng/optimus-ui/button';
import {Panel} from '@openng/optimus-ui/panel';
import {Paginator} from '@openng/optimus-ui/paginator';
import {TableLazyLoadEvent, TableModule} from '@openng/optimus-ui/table';
import {ResidentStatusComponent} from '../resident-status/resident-status-component';
import {ResidentFilters} from '../resident-filters/resident-filters';

@Component({
  selector: 'app-residents-table',
  imports: [
    AvatarComponent,
    Button,
    ResidentStatusComponent,
    Panel,
    Paginator,
    TableModule,
    ResidentFilters,
  ],
  templateUrl: './residents-table.html',
  styleUrl: './residents-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentsTable implements OnInit {
  readonly items = input.required<UserModel[]>();
  readonly pagination = input<ApiPaginationMeta>();
  readonly isLoading = input<boolean>(false);
  readonly isMobile = input<boolean>(false);
  readonly roles = input<BaseCatalogModel[]>([]);
  readonly statuses = input<BaseCatalogModel[]>([]);

  readonly paginate = output<Partial<SearchUser>>();
  readonly view = output<string>();

  protected readonly pageFirst = computed(() => {
    const pagination = this.pagination();
    return pagination ? (pagination.page - 1) * pagination.limit : 0;
  });

  protected readonly pageRows = computed(() => this.pagination()?.limit ?? 10);

  ngOnInit(): void {
    this.search({
      first: 0,
    } as TableLazyLoadEvent);
  }

  protected search(event: TableLazyLoadEvent) {
    this.paginate.emit({
      first: event.first,
      rows: event.rows || 10,
    });
  }

  protected paginateMobile(event: {first?: number; rows?: number}) {
    this.paginate.emit({
      first: event.first ?? 0,
      rows: event.rows || 10,
    });
  }

  protected filter(event: SearchUser) {
    this.paginate.emit({
      ...event,
    });
  }
}
