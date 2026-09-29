import {Component, input} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Button} from '@openng/optimus-ui/button';
import {PageHeader} from './page-header';

@Component({
  standalone: true,
  imports: [PageHeader, Button],
  template: `
    <app-page-header title="Titulo" [subTitle]="subTitle()">
      @if (withActions()) {
        <p-button label="Nuevo" />
      }
    </app-page-header>
  `,
})
class HostComponent {
  subTitle = input<string>();
  withActions = input(false);
}

describe('PageHeader', () => {
  let fixture: ComponentFixture<PageHeader>;

  const create = async (subTitle?: string) => {
    await TestBed.configureTestingModule({imports: [PageHeader]}).compileComponents();
    fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Fraccionamientos');
    if (subTitle !== undefined) {
      fixture.componentRef.setInput('subTitle', subTitle);
    }
    await fixture.whenStable();
    return fixture;
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    await create();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the title as the page h1', async () => {
    await create();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1.textContent?.trim()).toBe('Fraccionamientos');
  });

  it('should render exactly one h1 and no duplicate title block', async () => {
    await create('Busca y administra');
    const headings = fixture.nativeElement.querySelectorAll('h1');
    expect(headings.length).toBe(1);
  });

  it('should use a semantic header element as the host section', async () => {
    await create();
    expect(fixture.nativeElement.querySelector('header')).toBeTruthy();
  });

  it('should not render a subtitle when it is not provided', async () => {
    await create();
    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  });

  it('should not render a subtitle when it is an empty string', async () => {
    await create('');
    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  });

  it('should render the subtitle when it is provided', async () => {
    await create('Busca, filtra y administra los fraccionamientos.');
    const p = fixture.nativeElement.querySelector('p');
    expect(p).toBeTruthy();
    expect(p.textContent?.trim()).toBe('Busca, filtra y administra los fraccionamientos.');
  });

  it('should hide the subtitle on mobile and show it from the sm breakpoint up', async () => {
    await create('Subtitulo');
    const classes = fixture.nativeElement.querySelector('p').className;
    expect(classes).toContain('hidden');
    expect(classes).toContain('sm:block');
  });

  it('should keep the title visible on every viewport', async () => {
    await create('Subtitulo');
    const classes = fixture.nativeElement.querySelector('h1').className;
    expect(classes).not.toContain('hidden');
  });

  it('should size the title up from the sm breakpoint up', async () => {
    await create();
    const classes = fixture.nativeElement.querySelector('h1').className;
    expect(classes).toContain('text-xl');
    expect(classes).toContain('sm:text-2xl');
  });

  it('should support light and dark themes for the title', async () => {
    await create();
    const classes = fixture.nativeElement.querySelector('h1').className;
    expect(classes).toContain('text-slate-900');
    expect(classes).toContain('dark:text-white');
  });

  it('should support light and dark themes for the subtitle', async () => {
    await create('Subtitulo');
    const classes = fixture.nativeElement.querySelector('p').className;
    expect(classes).toContain('text-slate-500');
    expect(classes).toContain('dark:text-slate-400');
  });

  it('should keep title and actions on a single row with the actions on the opposite side', async () => {
    await create();
    const classes = fixture.nativeElement.querySelector('header').className;
    expect(classes).toContain('flex');
    expect(classes).toContain('items-center');
    expect(classes).toContain('justify-between');
    expect(classes).not.toContain('flex-col');
  });

  it('should cap the title block at half of the screen only while projected actions are present', async () => {
    await create();
    const classes = fixture.nativeElement.querySelector('header > div').className;
    expect(classes).toContain('min-w-0');
    expect(classes).toContain('max-sm:has-[~.page-header-actions:not(:empty)]:max-w-1/2');
    expect(classes).toContain('sm:max-w-none');
  });

  it('should truncate the title on mobile and let it wrap again from sm up', async () => {
    await create();
    const classes = fixture.nativeElement.querySelector('h1').className;
    expect(classes).toContain('truncate');
    expect(classes).toContain('sm:whitespace-normal');
  });

  it('should keep the projected actions at their natural width and never shrink them', async () => {
    await create();
    const classes = fixture.nativeElement.querySelector('header > div:last-child').className;
    expect(classes).toContain('shrink-0');
  });

  it('should let the title block size to its content instead of claiming the leftover space', async () => {
    await create();
    const classes = fixture.nativeElement.querySelector('header > div').className;
    expect(classes).not.toContain('flex-1');
    expect(classes).not.toContain('grow');
    expect(classes).not.toContain('w-full');
  });

  it('should render a block host so consumer spacing utilities such as mb-6 apply', async () => {
    await create();
    // An Angular host is display:inline by default, and vertical margins do not
    // apply to inline boxes, which silently drops any mb-* passed by the consumer.
    expect(fixture.nativeElement.className).toContain('block');
  });

  it('should keep the actions area out of the layout flow when it is empty', async () => {
    await create();
    const actions = fixture.nativeElement.querySelector('header > div:last-child');
    expect(actions).toBeTruthy();
    expect(actions.className).toContain('empty:hidden');
    expect(actions.matches(':empty')).toBe(true);
  });

  it('should tag the actions wrapper with the hook the conditional title cap targets', async () => {
    await create();
    const actions = fixture.nativeElement.querySelector('header > div:last-child');
    expect(actions.className).toContain('page-header-actions');
  });
});

describe('PageHeader content projection', () => {
  let fixture: ComponentFixture<HostComponent>;

  const create = async (withActions: boolean, subTitle?: string) => {
    await TestBed.configureTestingModule({imports: [HostComponent]}).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('withActions', withActions);
    if (subTitle !== undefined) {
      fixture.componentRef.setInput('subTitle', subTitle);
    }
    await fixture.whenStable();
    return fixture;
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should project page actions outside of the title block', async () => {
    await create(true);
    const actions = fixture.nativeElement.querySelector('header > div:last-child');
    expect(actions.textContent).toContain('Nuevo');
  });

  it('should project actions after the title in DOM order', async () => {
    await create(true);
    const header = fixture.nativeElement.querySelector('header');
    const [textBlock, actions] = header.children;
    expect(textBlock.querySelector('h1')).toBeTruthy();
    expect(actions.textContent).toContain('Nuevo');
  });

  it('should keep the projected actions out of the title and subtitle elements', async () => {
    await create(true, 'Subtitulo');
    const h1 = fixture.nativeElement.querySelector('h1');
    const p = fixture.nativeElement.querySelector('p');
    expect(h1.textContent).not.toContain('Nuevo');
    expect(p.textContent).not.toContain('Nuevo');
  });

  it('should leave the actions area empty when nothing is projected', async () => {
    await create(false);
    const actions = fixture.nativeElement.querySelector('header > div:last-child');
    expect(actions.matches(':empty')).toBe(true);
  });

  it('should render actions and subtitle independently', async () => {
    await create(true);
    const p = fixture.nativeElement.querySelector('p');
    expect(p).toBeNull();
    expect(fixture.nativeElement.querySelector('header > div:last-child').textContent).toContain(
      'Nuevo',
    );
  });

  it('should reflect projected actions added after the first render', async () => {
    await create(false);
    expect(fixture.nativeElement.querySelector('header > div:last-child').matches(':empty')).toBe(
      true,
    );

    fixture.componentRef.setInput('withActions', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('header > div:last-child').textContent).toContain(
      'Nuevo',
    );
  });

  it('should drop the half-screen title cap as soon as actions are projected', async () => {
    // The cap is CSS-only: `max-sm:has-[~.page-header-actions:not(:empty)]:max-w-1/2`.
    // jsdom's selector engine supports `:has()` only with a child combinator, so the
    // two DOM facts the selector relies on are asserted instead: the actions wrapper
    // is a following sibling carrying the hook, and it is `:empty` until something
    // is projected.
    await create(false);
    const [emptyBlock, emptyActions] = fixture.nativeElement.querySelector('header').children;
    expect(emptyActions.className).toContain('page-header-actions');
    expect(emptyActions.matches(':empty')).toBe(true);

    fixture.componentRef.setInput('withActions', true);
    await fixture.whenStable();

    const [filledBlock, filledActions] = fixture.nativeElement.querySelector('header').children;
    expect(filledBlock).toBe(emptyBlock);
    expect(filledActions.matches(':empty')).toBe(false);
  });
});

describe('PageHeader required title', () => {
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [PageHeader]}).compileComponents();
    fixture = TestBed.createComponent(PageHeader);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should throw NG0950 when the title is omitted, making the title mandatory', () => {
    expect(() => fixture.detectChanges()).toThrow(/NG0950/);
  });

  it('should render normally once the title is provided', () => {
    fixture.componentRef.setInput('title', 'Unidades');
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.componentInstance.title()).toBe('Unidades');
    expect(fixture.nativeElement.querySelector('h1').textContent?.trim()).toBe('Unidades');
  });
});
