import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from '@openng/optimus-ui/button';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { FilterSheet } from './filter-sheet';

@Component({
  standalone: true,
  imports: [FilterSheet, Button, InputTextModule],
  template: `
    <app-filter-sheet
      [title]="title()"
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      (closed)="onClosed()"
    >
      <input pInputText aria-label="Buscar" />
      <div filterSheetFooter>
        <p-button label="Aplicar" />
      </div>
    </app-filter-sheet>
  `,
})
class HostComponent {
  readonly title = signal('Filtros');
  readonly visible = signal(false);
  closedCount = 0;

  onClosed(): void {
    this.closedCount++;
  }
}

describe('FilterSheet', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const create = async (visible = false) => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    host.visible.set(visible);
    await fixture.whenStable();
    return fixture;
  };

  // the panel root element itself carries the `p-drawer` class
  const panel = () => document.body.querySelector('.p-drawer');
  const content = () => panel()?.querySelector('.p-drawer-content');
  const footer = () => panel()?.querySelector('.p-drawer-footer');
  const header = () => panel()?.querySelector('.p-drawer-header');

  // p-drawer binds its Escape handler to the legacy `event.which == 27`, which a
  // plain synthetic KeyboardEvent never sets, so the property is forced here.
  const pressEscape = () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    Object.defineProperty(event, 'which', { value: 27 });
    document.dispatchEvent(event);
  };

  // the close handler sits on the inner <button>, not on the p-button host
  const clickClose = () =>
    (panel()?.querySelector('.p-drawer-close-button button') as HTMLElement)?.click();

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    await create();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render anything in the DOM while hidden', async () => {
    await create(false);
    expect(panel()).toBeNull();
  });

  it('should render the overlay when visible', async () => {
    await create(true);
    expect(panel()).toBeTruthy();
    expect(panel()?.className).toContain('p-drawer-bottom');
  });

  it('should render the title in the sheet header', async () => {
    await create(true);
    expect(header()?.textContent).toContain('Filtros');
  });

  it('should project the filter form into the content area', async () => {
    await create(true);
    expect(content()?.querySelector('input[aria-label="Buscar"]')).toBeTruthy();
  });

  it('should project the footer actions only when the consumer provides them', async () => {
    await create(true);
    expect(footer()?.textContent).toContain('Aplicar');
  });

  it('should release the hard-coded drawer height and cap it at 85vh', async () => {
    await create(true);
    const classes = panel()?.className ?? '';
    expect(classes).toContain('h-auto');
    expect(classes).toContain('max-h-[85vh]');
    expect(classes).toContain('rounded-t-2xl');
  });

  it('should release the 100% height Optimus forces on the content area', async () => {
    // .p-drawer-bottom .p-drawer-content { height: 100% } collapses an
    // auto-height sheet, so the override has to win over the optimus layer.
    await create(true);
    expect(content()?.className).toContain('h-auto');
  });

  it('should keep the content scrollable', async () => {
    await create(true);
    expect(content()?.className).toContain('overflow-y-auto');
  });

  it('should render the overlay detached from the page flow', async () => {
    await create(true);
    // appendTo="body" keeps the fixed overlay out of any transformed ancestor
    expect(panel()?.parentElement?.tagName).toBe('BODY');
  });

  it('should close on Escape', async () => {
    await create(true);
    pressEscape();
    await fixture.whenStable();
    expect(host.visible()).toBe(false);
    expect(host.closedCount).toBe(1);
  });

  it('should close through the header close button', async () => {
    await create(true);
    clickClose();
    await fixture.whenStable();
    expect(host.visible()).toBe(false);
    expect(host.closedCount).toBe(1);
  });

  it('should report close exactly once per dismissal', async () => {
    await create(true);
    pressEscape();
    await fixture.whenStable();
    pressEscape();
    await fixture.whenStable();
    expect(host.closedCount).toBe(1);
  });
});
