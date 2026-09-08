import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SessionService } from "@core/services";
import { SearchNeigh } from "@nexhouse/shared-domain/interfaces";
import { Button } from "@openng/optimus-ui/button";
import { IconFieldModule } from "@openng/optimus-ui/iconfield";
import { InputIconModule } from "@openng/optimus-ui/inputicon";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { SelectButtonModule } from "@openng/optimus-ui/selectbutton";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
  selector: "app-neigh-table-filters",
  imports: [
    InputTextModule,
    Button,
    SelectButtonModule,
    IconFieldModule,
    InputIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./neigh-table-filters.html",
  styleUrl: "./neigh-table-filters.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NeighTableFilters implements OnInit {
  protected readonly sessionService = inject(SessionService);
  protected readonly statusOptions: { value: any; label: string }[] = [
    { value: null, label: "Todos" },
    { value: true, label: "Activos" },
    { value: false, label: "Inactivos" },
  ];

  protected filters = signal<SearchNeigh>({});
  protected filter = output<SearchNeigh>();
  protected form = new FormGroup({
    hint: new FormControl<string | null>(null, { nonNullable: true }),
    active: new FormControl<boolean | undefined>(undefined, {
      nonNullable: true,
    }),
  });

  protected isSmallMid = computed(
    () => this.sessionService.isMobile() || this.sessionService.isTablet(),
  );

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.filters.update((f) => ({
          ...f,
          globalFilter:
            value.hint && value.hint !== "" ? value.hint : undefined,
          isActive:
            value.active !== undefined && value.active !== null
              ? value.active
              : undefined,
        }));

        this.filter.emit(this.filters());
      });
  }
}
