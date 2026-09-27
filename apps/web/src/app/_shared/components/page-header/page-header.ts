import {ChangeDetectionStrategy, Component, input} from '@angular/core';

/**
 * Standardised page title section: a required `title` rendered as the page
 * `<h1>`, an optional `subTitle` that is hidden below the `sm` breakpoint, and a
 * content-projection area for the page actions (buttons, filters, menus).
 */
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  host: { class: 'block' },
})
export class PageHeader {
  title = input.required<string>();
  subTitle = input<string>();
}
