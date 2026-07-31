import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from "@angular/core";
import { FormGroup, FormControl, ReactiveFormsModule } from "@angular/forms";
import { Search } from "@nexhouse/shared-domain/interfaces";
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
  selector: "app-units-filters",
  imports: [InputTextModule, ReactiveFormsModule, Button],
  templateUrl: "./units-filters.html",
  styleUrl: "./units-filters.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class UnitsFilters implements OnInit {
  protected filter = output<Search>();
  protected filters = signal<Search>({});
  protected readonly form = new FormGroup({
    globalFilter: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.filters.update((f) => ({
          ...f,
          globalFilter:
            value.globalFilter && value.globalFilter !== ""
              ? value.globalFilter
              : undefined,
        }));

        this.filter.emit(this.filters());
      });
  }
}
