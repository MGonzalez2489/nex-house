import {NgTemplateOutlet} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
} from '@angular/core';
import {SessionService} from '@core/services';
import {Panel, PanelPassThrough, PanelPassThroughOptions} from '@openng/optimus-ui/panel';

/**
 * Pass-through applied when the card is flattened (see `noCardOnMobile`).
 * Neutralises the chrome the Optimus `Panel` style applies by default so the
 * content can flow edge to edge on small viewports.
 */
const FLAT_PT: PanelPassThrough = {
  root: 'bg-transparent border-0 rounded-none',
  header: 'bg-transparent border-0 px-0 pt-0',
  content: 'px-0',
  footer: 'px-0 pt-0',
};

type PtSection = PanelPassThroughOptions[keyof PanelPassThroughOptions];
type PtRecord = Record<string, PtSection>;

/**
 * Concatenates two `pt` sections when both are plain class strings so that
 * consumers can *add* to a section instead of replacing it wholesale. Any other
 * combination (attribute records, callbacks) lets the override win.
 */
function mergeSection(base: PtSection, override: PtSection): PtSection {
  if (typeof base === 'string' && typeof override === 'string') {
    return `${base} ${override}`.trim();
  }
  return override === undefined || override === null ? base : override;
}

function mergePt(...sources: (PanelPassThrough | undefined)[]): PanelPassThrough {
  const merged: PtRecord = {};
  for (const source of sources) {
    if (!source) {
      continue;
    }
    if (typeof source === 'function') {
      return source;
    }
    for (const [section, value] of Object.entries(source)) {
      merged[section] = mergeSection(merged[section], value);
    }
  }
  return merged as PanelPassThrough;
}

@Component({
  selector: 'app-nex-card',
  imports: [Panel, NgTemplateOutlet],
  templateUrl: './nex-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NexCard {
  readonly headerText = input<string>();
  readonly subHeader = input<string>();

  /**
   * When `true` (default) and the viewport is mobile, the panel chrome
   * (background, border, radius and inner padding) is removed so the content
   * can use the full width.
   */
  readonly noCardOnMobile = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });

  /** Enables the Optimus `Panel` collapse/expand feature. */
  readonly toggleable = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });

  /** Two-way collapsed state, only meaningful when `toggleable` is set. */
  readonly collapsed = model<boolean>(false);

  /** Pass-through forwarded to `Panel`, applied on every viewport. */
  readonly pt = input<PanelPassThrough>();

  /**
   * Pass-through merged on top of the base one when the viewport is mobile.
   * Use it to tune the mobile look per consumer; it wins over the flatten
   * defaults applied by `noCardOnMobile`.
   */
  readonly mobilePt = input<PanelPassThrough>();

  /**
   * Content slots.
   *
   * Every selector is namespaced with a `nex` prefix on purpose: the wrapper
   * re-exposes the very same `Panel` sections (`#header`, `#icons`,
   * `#content`, `#footer`), so unprefixed names would collide with the slots of
   * the Optimus components rendered inside the body.
   *
   * Signal based queries replace the `@ContentChild` decorator so the slots can
   * safely be combined with `computed()` and stay reactive.
   */
  protected readonly headerTemplate = contentChild<TemplateRef<unknown>>('nexHeader');
  protected readonly actionsTemplate = contentChild<TemplateRef<unknown>>('nexActions');
  protected readonly contentTemplate = contentChild<TemplateRef<unknown>>('nexContent');
  protected readonly footerTemplate = contentChild<TemplateRef<unknown>>('nexFooter');

  private readonly sessionService = inject(SessionService);

  /** `true` when the card must render without panel chrome. */
  protected readonly flattened = computed(
    () => this.noCardOnMobile() && this.sessionService.isMobile(),
  );

  /**
   * The panel header is only rendered when it has something to show, otherwise
   * it would leave an empty bar taking vertical space.
   */
  protected readonly showPanelHeader = computed(
    () =>
      this.toggleable() ||
      !!this.headerText() ||
      !!this.headerTemplate() ||
      !!this.actionsTemplate(),
  );

  protected readonly resolvedPt = computed<PanelPassThrough>(() => {
    // The footer template is always projected to `Panel` (see the template
    // file), so the footer element has to be hidden while it stays empty.
    const emptyFooter: PanelPassThrough = this.footerTemplate() ? {} : {footer: 'hidden'};
    const base = mergePt(this.pt(), emptyFooter);

    if (!this.sessionService.isMobile()) {
      return base;
    }
    return mergePt(base, this.flattened() ? FLAT_PT : {}, this.mobilePt());
  });
}
