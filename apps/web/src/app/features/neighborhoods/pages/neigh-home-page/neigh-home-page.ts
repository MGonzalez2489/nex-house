import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {SessionService} from '@core/services';
import {NEIGHBORHOOD_ROUTES_ENUM} from '@neighborhoods/neighborhood.routes';
import {NeighborhoodsStore} from '@neighborhoods/neighborhood.store';
import {SearchNeigh} from '@nexhouse/shared-domain/interfaces';
import {countActiveFilters} from '@nexhouse/shared-domain/utils';
import {Button} from '@openng/optimus-ui/button';
import {BadgeModule} from '@openng/optimus-ui/badge';
import {FormFeedback} from '@shared/components/forms';
import {NeighborhoodsTable} from '../../components';
import {FilterSheet, PageHeader} from '@shared/components';
import {NeighTableFilters} from '../../components/neigh-table-filters/neigh-table-filters';

@Component({
  selector: 'app-neigh-home-page',
  imports: [
    NeighborhoodsTable,
    Button,
    BadgeModule,
    FormFeedback,
    PageHeader,
    FilterSheet,
    NeighTableFilters,
  ],
  templateUrl: './neigh-home-page.html',
  styleUrl: './neigh-home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NeighHomePage {
  private readonly router = inject(Router);
  protected readonly neighStore = inject(NeighborhoodsStore);
  protected readonly sessionService = inject(SessionService);

  protected readonly entries = computed(() => this.neighStore.entities());
  protected readonly activeEntries = computed(
    () => this.entries().filter((g) => g.isActive).length,
  );
  protected readonly totalRegistered = computed(
    () => this.neighStore.pagination()?.total ?? this.entries().length,
  );

  protected readonly appliedFilters = signal<SearchNeigh>({});
  protected readonly draftFilters = signal<SearchNeigh>({});

  protected readonly sheetOpen = signal(false);

  /** True while the user typed something that is not applied yet. */
  protected readonly hasPendingChanges = computed(
    () => JSON.stringify(this.draftFilters()) !== JSON.stringify(this.appliedFilters()),
  );

  /**
   * How many filters are applied, surfaced as a badge on the mobile trigger so
   * the sheet's state is visible while it is closed.
   */
  protected readonly activeFilterCount = computed(() => countActiveFilters(this.appliedFilters()));

  /** The badge is visual only, so the count has to reach the accessible name. */
  protected readonly filterButtonLabel = computed(() => {
    const count = this.activeFilterCount();
    return count === 0
      ? 'Filtrar fraccionamientos'
      : `Filtrar fraccionamientos (${count} ${
          count === 1 ? 'filtro aplicado' : 'filtros aplicados'
        })`;
  });

  onCreate(): void {
    this.router.navigate([`/${NEIGHBORHOOD_ROUTES_ENUM.HOME}/${NEIGHBORHOOD_ROUTES_ENUM.NEW}`]);
  }

  onSearch(filters: SearchNeigh) {
    this.appliedFilters.set(filters);
    this.neighStore.loadAll(filters);
  }

  onView(id: string) {
    this.router.navigate([`${NEIGHBORHOOD_ROUTES_ENUM.HOME}`, id]);
  }

  /** Opens the sheet seeding the draft with whatever is currently applied. */
  protected openFilters(): void {
    this.draftFilters.set(this.appliedFilters());
    this.sheetOpen.set(true);
  }

  /** Applies the draft and reloads. */
  protected applyFilters(): void {
    const draft = this.draftFilters();
    this.sheetOpen.set(false);
    this.onSearch(draft);
  }

  /** Empties the draft without closing the sheet, so the user can confirm. */
  protected clearDraft(): void {
    this.draftFilters.set({});
  }

  /** Discards the draft on dismissal. */
  protected onSheetClosed(): void {
    this.sheetOpen.set(false);
  }
}
