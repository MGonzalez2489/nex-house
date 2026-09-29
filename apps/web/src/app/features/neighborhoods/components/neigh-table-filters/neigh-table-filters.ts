import {ChangeDetectionStrategy, Component, effect, input, output, signal} from '@angular/core';
import {debounce, form, FormField} from '@angular/forms/signals';
import {SearchNeigh} from '@nexhouse/shared-domain/interfaces';
import {IconFieldModule} from '@openng/optimus-ui/iconfield';
import {InputIconModule} from '@openng/optimus-ui/inputicon';
import {InputTextModule} from '@openng/optimus-ui/inputtext';

@Component({
  selector: 'app-neigh-table-filters',
  imports: [InputTextModule, IconFieldModule, InputIconModule, FormField],
  templateUrl: './neigh-table-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NeighTableFilters {
  readonly existingFilters = input<SearchNeigh>({});
  protected readonly filter = output<SearchNeigh>();

  formModel = signal({globalFilter: ''});
  form = form(this.formModel, (f) => {
    debounce(f, 300);
  });

  constructor() {
    effect(() => {
      const fValue = this.form().value().globalFilter;
      const eValue = this.existingFilters().globalFilter || '';
      const isDifferentValue = eValue !== fValue;
      if (isDifferentValue) {
        this.filter.emit({globalFilter: fValue});
      }
    });
  }

  protected onFormSubmit(event: SubmitEvent) {
    event.preventDefault();
  }
}
