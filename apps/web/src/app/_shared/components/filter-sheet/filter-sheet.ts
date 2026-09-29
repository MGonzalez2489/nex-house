import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { DrawerModule } from '@openng/optimus-ui/drawer';

/**
 * Pass-through applied to the underlying `p-drawer`.
 *
 * Optimus ships `.p-drawer-bottom { height: 10rem }` and
 * `.p-drawer-bottom .p-drawer-content { height: 100% }`, which is too short for
 * a filter form and turns the auto height into a cyclic percentage. Both are
 * released here so the sheet hugs its content, capped at 85vh with a scrollable
 * body. The mask lives on the host, which is why it is stretched to the viewport.
 */
const SHEET_PT = {
  host: 'contents',
  root: 'h-auto max-h-[85vh] rounded-t-2xl',
  content: 'h-auto p-0 overflow-y-auto',
  footer: 'p-0',
} as const;

/**
 * Generic bottom sheet for a filter form, used when the inline filters do not
 * fit the viewport (mobile). It is deliberately dumb: it owns the overlay and
 * nothing else, so the consumer keeps ownership of the filter state and decides
 * when the draft is applied.
 */
@Component({
  selector: 'app-filter-sheet',
  imports: [DrawerModule],
  templateUrl: './filter-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class FilterSheet {
  /** Two-way visibility of the sheet. */
  visible = model(false);

  /** Title rendered in the sheet header, next to the close button. */
  title = input.required<string>();

  /** Emitted whenever the overlay asks to be closed (Esc, mask, close button). */
  closed = output<void>();

  protected readonly pt = SHEET_PT;

  protected onVisibleChange(visible: boolean): void {
    this.visible.set(visible);
    if (!visible) {
      this.closed.emit();
    }
  }
}
