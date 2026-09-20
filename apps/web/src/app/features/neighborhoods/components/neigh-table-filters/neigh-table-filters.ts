import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SearchNeigh } from "@nexhouse/shared-domain/interfaces";
import { IconFieldModule } from "@openng/optimus-ui/iconfield";
import { InputIconModule } from "@openng/optimus-ui/inputicon";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
  selector: "app-neigh-table-filters",
  imports: [
    InputTextModule,
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
  private readonly destroyRef = inject(DestroyRef);

  protected filters = signal<SearchNeigh>({});
  protected filter = output<SearchNeigh>();
  protected form = new FormGroup({
    hint: new FormControl<string | null>(null, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => a.hint === b.hint),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.filters.update((f) => ({
          ...f,
          globalFilter:
            value.hint && value.hint !== "" ? value.hint : undefined,
        }));

        this.filter.emit(this.filters());
      });
  }

  /**
   * Guards the implicit form submission (pressing Enter on the text input)
   * which would otherwise reload the page.
   */
  protected onFormSubmit(event: SubmitEvent): void {
    event.preventDefault();
  }
}