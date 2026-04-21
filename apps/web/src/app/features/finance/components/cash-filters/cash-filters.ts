import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnInit,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchTransaction } from '@nex-house/interfaces';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-cash-filters',
  imports: [
    Card,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    ButtonModule,
    DatePickerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './cash-filters.html',
  styleUrl: './cash-filters.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashFilters implements OnInit {
  private readonly debounceTime = 300;
  readonly filters = input<SearchTransaction>();
  protected readonly doSearch = output<SearchTransaction>();
  protected readonly maxDate = new Date();
  readonly initDate = input<string>();

  formatedInitDate = computed(() => {
    const cInitDate = this.initDate();
    if (!cInitDate) {
      const today = new Date();
      today.setMonth(0);
      return today;
    }
    return new Date(cInitDate);
  });

  protected readonly form = new FormGroup({
    hint: new FormControl('', { nonNullable: true }),
    category: new FormControl('', { nonNullable: true }),
    date: new FormControl(new Date(), { nonNullable: true }),
  });

  protected readonly fChanges = toSignal(
    this.form.valueChanges.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged((prev, curr) => {
        return (
          prev.hint === curr.hint &&
          prev.category === curr.category &&
          prev.date === curr.date
        );
      }),
    ),
  );

  constructor() {
    effect(() => {
      const formValue = this.fChanges();
      if (formValue && formValue.date) {
        const searchTransaction: SearchTransaction = {
          globalFilter: formValue.hint,
          category: formValue.category,
          year: new Date(formValue.date).getFullYear(),
          month: new Date(formValue.date).getMonth(),
        };
        this.doSearch.emit(searchTransaction);
      }
    });
  }
  ngOnInit(): void {
    this.form.patchValue({
      hint: '',
    });
  }
}
