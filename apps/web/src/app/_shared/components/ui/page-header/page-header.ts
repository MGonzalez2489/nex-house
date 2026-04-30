import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-page-header',
  imports: [Breadcrumbs],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class PageHeader {
  title = input.required<string>();
  subTitle = input<string>();

  showActionsOnSM = input<boolean>(false);
  showSubTitleOnSM = input<boolean>(false);
}
