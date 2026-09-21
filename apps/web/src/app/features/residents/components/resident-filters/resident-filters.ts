import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {SearchUser} from '@nexhouse/shared-domain/interfaces';
import {BaseCatalogModel} from '@nexhouse/shared-domain/models';
import {IconFieldModule} from '@openng/optimus-ui/iconfield';
import {InputIconModule} from '@openng/optimus-ui/inputicon';
import {InputTextModule} from '@openng/optimus-ui/inputtext';
import {Select} from '@openng/optimus-ui/select';
import {debounceTime, distinctUntilChanged} from 'rxjs';

@Component({
  selector: 'app-resident-filters',
  imports: [InputTextModule, InputIconModule, IconFieldModule, ReactiveFormsModule, Select],
  templateUrl: './resident-filters.html',
  styleUrl: './resident-filters.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentFilters implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly roles = input<BaseCatalogModel[]>([]);
  readonly statuses = input<BaseCatalogModel[]>([]);
  readonly isMobile = input<boolean>();

  readonly roleOptions = computed<BaseCatalogModel[]>(() => {
    const cRoles = this.roles();
    const result: BaseCatalogModel[] = [
      {
        publicId: '-1',
        name: 'all',
        displayName: 'Todos',
      },
      ...cRoles,
    ];

    return result;
  });
  readonly statusOptions = computed<BaseCatalogModel[]>(() => {
    const cRoles = this.statuses();
    const result: BaseCatalogModel[] = [
      {
        publicId: '-1',
        name: 'all',
        displayName: 'Todos',
      },
      ...cRoles,
    ];

    return result;
  });

  protected filter = output<SearchUser>();
  protected readonly form = new FormGroup({
    globalFilter: new FormControl<string>('', {nonNullable: true}),
    role: new FormControl<string>('all', {nonNullable: true}),
    status: new FormControl<string>('all', {nonNullable: true}),
  });

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => this.sameFilters(a, b)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => this.emit(value));
  }

  /**
   * Guards the implicit form submission (pressing Enter on the text input)
   * which would otherwise reload the page.
   */
  protected onFormSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.emit(this.form.value);
  }

  private emit(value: Partial<SearchUser>): void {
    const r = value.role && value.role !== 'all' ? value.role : undefined;
    const s = value.role && value.status !== 'all' ? value.role : undefined;
    this.filter.emit({
      first: 0,
      globalFilter: value.globalFilter?.trim() || undefined,
      role: r,
      status: s,
    });
  }

  private sameFilters(a: Partial<SearchUser>, b: Partial<SearchUser>): boolean {
    return a.globalFilter === b.globalFilter && a.role === b.role && a.status === b.status;
  }
}
