import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { SessionService } from "@core/services";
import { NeighborhoodsStore } from "@neighborhoods/neighborhood.store";
import { SearchNeigh } from "@nexhouse/shared-domain/interfaces";
import { Button } from "primeng/button";
import { NeighborhoodsTable, NeighTableFilters } from "../../components";
import { SelectButtonModule } from "primeng/selectbutton";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-neigh-home-page",
  imports: [
    NeighborhoodsTable,
    NeighTableFilters,
    Button,
    SelectButtonModule,
    FormsModule,
  ],
  templateUrl: "./neigh-home-page.html",
  styleUrl: "./neigh-home-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NeighHomePage implements OnInit {
  private readonly router = inject(Router);
  protected readonly neighStore = inject(NeighborhoodsStore);
  protected readonly sessionService = inject(SessionService);

  protected readonly statusOptions: { value: any; icon: string }[] = [
    { value: "table", icon: "pi pi-table" },
    { value: "list", icon: "pi pi-list" },
  ];
  dataView = signal<"table" | "list">("table");

  protected readonly entries = computed(() => this.neighStore.entities());
  protected readonly activeEntries = computed(
    () => this.entries().filter((g) => g.isActive).length,
  );
  protected readonly isFiltering = signal<boolean>(false);

  constructor() {
    effect(() => {
      const isCMobile = this.sessionService.isMobile();
      if (isCMobile) {
        this.isFiltering.set(true);
      }
    });
  }

  ngOnInit(): void {
    this.onSearch({});
  }

  onCreate(): void {
    this.router.navigate(["/neighborhoods/new"]);
  }

  onSearch(filters: SearchNeigh) {
    this.neighStore.loadAll(filters);
  }
}
