/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { CatalogsStore } from '@features/finance/stores';
import {
  TransactionCategoriesEnum,
  TransactionTypeEnum,
} from '@nex-house/enums';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-transaction-category-select',
  imports: [SelectModule, FormsModule],
  templateUrl: './transaction-category-select.html',
  styleUrl: './transaction-category-select.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TransactionCategorySelect),
      multi: true,
    },
  ],
})
export class TransactionCategorySelect implements ControlValueAccessor {
  private readonly store = inject(CatalogsStore);
  placeholder = input<string>('Selecciona una categoría');
  filter = input<boolean>(false);
  allowedType = input.required<TransactionTypeEnum>();
  variant = input<'filled' | 'outlined'>('filled');
  showAnulationCat = input<boolean>(false);

  filteredCategories = computed(() => {
    const all = this.store.transactionCategoriesEntities();
    const allowed = this.allowedType();
    if (!all || !allowed) return [];

    let filtered = all.filter(
      (c) =>
        c.allowedType === this.allowedType().toString() ||
        c.allowedType === TransactionTypeEnum.BOTH.toString(),
    );

    if (!this.showAnulationCat()) {
      filtered = filtered.filter(
        (f) => f.name !== TransactionCategoriesEnum.CANCELLATION,
      );
    }

    return [...filtered].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      const isOtherA = nameA === 'otros' || nameA === 'otro';
      const isOtherB = nameB === 'otros' || nameB === 'otro';

      // "Otros" siempre al final
      if (isOtherA && !isOtherB) return 1;
      if (!isOtherA && isOtherB) return -1;

      // Si ninguno es "Otros", orden alfabético estándar
      return nameA.localeCompare(nameB);
    });
  });

  getIcon(iconName?: string): string {
    const iconMap: Record<string, string> = {
      maintenance: 'pi pi-home',
      utilities: 'pi pi-bolt',
      repairs: 'pi pi-wrench',
      security: 'pi pi-shield',
      events: 'pi pi-users',
      others: 'pi pi-ellipsis-h',
    };
    return iconMap[iconName || ''] || 'pi pi-tag';
  }

  getCategoryById(id: string) {
    return this.store.transactionCategoriesEntityMap()[id];
  }

  // Implementación de ControlValueAccessor
  internalValue: string | null = null;

  onChange: any = () => {};
  onTouched: any = () => {};

  onSelect(val: string) {
    this.internalValue = val;
    this.onChange(val);
  }

  writeValue(val: any): void {
    this.internalValue = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
