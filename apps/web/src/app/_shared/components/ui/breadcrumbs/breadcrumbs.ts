import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breadcrumbs {
  protected readonly bcService = inject(BreadcrumbService);
}
