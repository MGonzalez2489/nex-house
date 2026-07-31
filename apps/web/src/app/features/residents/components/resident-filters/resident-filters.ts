import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SearchUser } from "@nexhouse/shared-domain/interfaces";
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
  selector: "app-resident-filters",
  imports: [Button, InputTextModule, ReactiveFormsModule],
  templateUrl: "./resident-filters.html",
  styleUrl: "./resident-filters.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentFilters implements OnInit {
  protected filter = output<SearchUser>();
  protected filters = signal<SearchUser>({});
  protected readonly form = new FormGroup({
    globalFilter: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    role: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    status: new FormControl<string | undefined>(undefined, {
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
