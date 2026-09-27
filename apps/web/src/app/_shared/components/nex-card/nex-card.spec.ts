import {Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SessionService} from '@core/services';
import {NexCard} from './nex-card';

@Component({
  selector: 'app-nex-card-host',
  imports: [NexCard],
  template: `
    <app-nex-card
      [headerText]="headerText()"
      [noCardOnMobile]="noCardOnMobile()"
      [toggleable]="toggleable()"
      [(collapsed)]="collapsed"
      [pt]="pt()"
      [mobilePt]="mobilePt()"
    >
      @if (loose()) {
        <p class="LOOSE">loose body</p>
      }
      @if (headerTpl()) {
        <ng-template #nexHeader><span class="SLOT-HEADER">slot header</span></ng-template>
      }
      @if (actionsTpl()) {
        <ng-template #nexActions><span class="SLOT-ACTIONS">slot actions</span></ng-template>
      }
      @if (contentTpl()) {
        <ng-template #nexContent><span class="SLOT-CONTENT">slot body</span></ng-template>
      }
      @if (footerTpl()) {
        <ng-template #nexFooter><span class="SLOT-FOOTER">slot footer</span></ng-template>
      }
    </app-nex-card>
  `,
  standalone: true,
})
class HostComponent {
  readonly headerText = signal<string | undefined>(undefined);
  readonly noCardOnMobile = signal(true);
  readonly toggleable = signal(false);
  readonly collapsed = signal(false);
  readonly pt = signal<Record<string, string> | undefined>(undefined);
  readonly mobilePt = signal<Record<string, string> | undefined>(undefined);

  readonly loose = signal(false);
  readonly headerTpl = signal(false);
  readonly actionsTpl = signal(false);
  readonly contentTpl = signal(false);
  readonly footerTpl = signal(false);
}

@Component({
  selector: 'app-inner-card',
  imports: [NexCard],
  template: `
    <app-nex-card headerText="INNER">
      <ng-template #nexContent><span class="INNER-BODY">inner body</span></ng-template>
    </app-nex-card>
  `,
  standalone: true,
})
class InnerCard {}

@Component({
  selector: 'app-nested-host',
  imports: [NexCard, InnerCard],
  template: `
    <app-nex-card headerText="OUTER">
      <app-inner-card />
    </app-nex-card>
  `,
  standalone: true,
})
class NestedHost {}

describe('NexCard', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let session: SessionService;

  const el = () => fixture.nativeElement as HTMLElement;
  const panel = () => el().querySelector('p-panel') as HTMLElement;
  const header = () => el().querySelector('.p-panel-header') as HTMLElement | null;
  const headerActions = () => el().querySelector('.p-panel-header-actions') as HTMLElement | null;
  const content = () => el().querySelector('.p-panel-content') as HTMLElement | null;
  const footer = () => el().querySelector('.p-panel-footer') as HTMLElement | null;

  const setMobile = (isMobile: boolean) => session._viewSize.set(isMobile ? 'small' : 'large');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    session = TestBed.inject(SessionService);
    setMobile(false);
    await fixture.whenStable();
  });

  describe('rendering', () => {
    it('should create', () => {
      expect(TestBed.createComponent(NexCard).componentInstance).toBeTruthy();
    });

    it('should wrap the optimus panel', () => {
      expect(panel()).toBeTruthy();
      expect(panel().classList).toContain('p-panel');
    });

    it('should not render an empty header', () => {
      expect(header()).toBeNull();
    });

    it('should hide the footer while it is empty', () => {
      expect(footer()?.className).toContain('hidden');
    });
  });

  describe('header slot', () => {
    it('should render headerText inside the panel header, not the body', () => {
      host.headerText.set('Neighborhoods');
      fixture.detectChanges();

      expect(header()?.textContent).toContain('Neighborhoods');
      expect(content()?.textContent).not.toContain('Neighborhoods');
    });

    it('should render headerText as a level 2 heading', () => {
      host.headerText.set('Neighborhoods');
      fixture.detectChanges();

      expect(header()?.querySelector('h2')?.textContent?.trim()).toBe('Neighborhoods');
    });

    it('should let the #nexHeader template win over headerText', () => {
      host.headerText.set('ignored');
      host.headerTpl.set(true);
      fixture.detectChanges();

      expect(header()?.textContent).toContain('slot header');
      expect(header()?.textContent).not.toContain('ignored');
    });

    it('should render the #nexHeader template', () => {
      host.headerTpl.set(true);
      fixture.detectChanges();

      expect(header()?.textContent).toContain('slot header');
    });

    it('should render the #nexHeader template inside the header actions area sibling', () => {
      host.actionsTpl.set(true);
      fixture.detectChanges();

      expect(headerActions()?.textContent).toContain('slot actions');
    });

    it('should reveal the header when headerText arrives after the first render', async () => {
      expect(header()).toBeNull();

      host.headerText.set('late');
      await fixture.whenStable();

      expect(header()?.textContent).toContain('late');
    });

    it('should reveal the header when the #nexHeader template arrives after the first render', async () => {
      expect(header()).toBeNull();

      host.headerTpl.set(true);
      await fixture.whenStable();

      expect(header()?.textContent).toContain('slot header');
    });
  });

  describe('body projection', () => {
    it('should project loose content that is not wrapped in a template', () => {
      host.loose.set(true);
      fixture.detectChanges();

      expect(content()?.querySelector('.LOOSE')).toBeTruthy();
    });

    it('should render the #nexContent template', () => {
      host.contentTpl.set(true);
      fixture.detectChanges();

      expect(content()?.textContent).toContain('slot body');
    });

    it('should keep both loose content and the #nexContent template', () => {
      host.loose.set(true);
      host.contentTpl.set(true);
      fixture.detectChanges();

      expect(content()?.querySelector('.LOOSE')).toBeTruthy();
      expect(content()?.textContent).toContain('slot body');
    });

    it('should render the #nexContent template when it arrives after the first render', async () => {
      expect(content()?.textContent).not.toContain('slot body');

      host.contentTpl.set(true);
      await fixture.whenStable();

      expect(content()?.textContent).toContain('slot body');
    });
  });

  describe('footer slot', () => {
    it('should stop hiding the footer once the #nexFooter template is provided', () => {
      host.footerTpl.set(true);
      fixture.detectChanges();

      expect(footer()?.className).not.toContain('hidden');
      expect(footer()?.textContent).toContain('slot footer');
    });

    it('should render the #nexFooter template when it arrives after the first render', async () => {
      expect(footer()?.className).toContain('hidden');

      host.footerTpl.set(true);
      await fixture.whenStable();

      expect(footer()?.textContent).toContain('slot footer');
    });

    it('should hide the footer again when the #nexFooter template is removed', () => {
      host.footerTpl.set(true);
      fixture.detectChanges();
      expect(footer()?.className).not.toContain('hidden');

      host.footerTpl.set(false);
      fixture.detectChanges();

      expect(footer()?.className).toContain('hidden');
    });
  });

  describe('slot isolation', () => {
    it('should not treat optimus panel slot names as nex-card slots', () => {
      expect(header()).toBeNull();
      expect(headerActions()).toBeNull();
      expect(footer()?.className).toContain('hidden');
    });

    it('should not steal the slots of a nested nex-card', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [NestedHost],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();

      const nested = TestBed.createComponent(NestedHost);
      await nested.whenStable();

      const nestedEl = nested.nativeElement as HTMLElement;
      expect(nestedEl.querySelectorAll('.INNER-BODY').length).toBe(1);
    });
  });

  describe('responsive behaviour', () => {
    it('should keep the card chrome on desktop', () => {
      setMobile(false);
      fixture.detectChanges();

      expect(panel().className).not.toContain('bg-transparent');
    });

    it('should flatten the card on mobile', () => {
      setMobile(true);
      fixture.detectChanges();

      expect(panel().className).toContain('bg-transparent');
      expect(panel().className).toContain('border-0');
      expect(panel().className).toContain('rounded-none');
    });

    it('should strip the inner panel padding on mobile', () => {
      host.headerText.set('title');
      setMobile(true);
      fixture.detectChanges();

      expect(header()?.className).toContain('px-0');
      expect(content()?.className).toContain('px-0');
    });

    it('should keep the inner panel padding on desktop', () => {
      host.headerText.set('title');
      setMobile(false);
      fixture.detectChanges();

      expect(content()?.className).not.toContain('px-0');
    });

    it('should keep the card on mobile when noCardOnMobile is false', () => {
      host.noCardOnMobile.set(false);
      setMobile(true);
      fixture.detectChanges();

      expect(panel().className).not.toContain('bg-transparent');
    });

    it('should react to a viewport change back to desktop', () => {
      setMobile(true);
      fixture.detectChanges();
      expect(panel().className).toContain('bg-transparent');

      setMobile(false);
      fixture.detectChanges();

      expect(panel().className).not.toContain('bg-transparent');
    });
  });

  describe('pass-through', () => {
    it('should apply the consumer pt on every viewport', () => {
      host.pt.set({root: 'CUSTOM-ROOT'});
      setMobile(false);
      fixture.detectChanges();
      expect(panel().className).toContain('CUSTOM-ROOT');

      setMobile(true);
      fixture.detectChanges();
      expect(panel().className).toContain('CUSTOM-ROOT');
    });

    it('should add to a section instead of replacing it', () => {
      host.pt.set({root: 'CUSTOM-ROOT'});
      setMobile(true);
      fixture.detectChanges();

      expect(panel().className).toContain('CUSTOM-ROOT');
      expect(panel().className).toContain('bg-transparent');
    });

    it('should apply mobilePt on mobile', () => {
      host.mobilePt.set({root: 'MOBILE-ROOT'});
      setMobile(true);
      fixture.detectChanges();

      expect(panel().className).toContain('MOBILE-ROOT');
    });

    it('should not apply mobilePt on desktop', () => {
      host.mobilePt.set({root: 'MOBILE-ROOT'});
      setMobile(false);
      fixture.detectChanges();

      expect(panel().className).not.toContain('MOBILE-ROOT');
    });

    it('should apply mobilePt on mobile even when the card is kept', () => {
      host.noCardOnMobile.set(false);
      host.mobilePt.set({root: 'MOBILE-ROOT'});
      setMobile(true);
      fixture.detectChanges();

      expect(panel().className).toContain('MOBILE-ROOT');
      expect(panel().className).not.toContain('bg-transparent');
    });
  });

  describe('toggleable', () => {
    it('should render the header when only toggleable is set', () => {
      host.toggleable.set(true);
      fixture.detectChanges();

      expect(header()).toBeTruthy();
      expect(header()?.querySelector('button')).toBeTruthy();
    });

    it('should not render a toggle button by default', () => {
      host.headerText.set('title');
      fixture.detectChanges();

      expect(header()?.querySelector('button')).toBeNull();
    });

    it('should propagate the collapsed state to the consumer', () => {
      host.toggleable.set(true);
      fixture.detectChanges();

      (header()?.querySelector('button') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(host.collapsed()).toBe(true);
    });
  });
});
