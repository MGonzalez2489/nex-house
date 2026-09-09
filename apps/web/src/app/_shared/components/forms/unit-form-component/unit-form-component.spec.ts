import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  BaseCatalogModel,
  NeighStreetModel,
  UnitModel,
} from '@nexhouse/shared-domain/models';
import {CreateUnit} from '@nexhouse/shared-domain/interfaces';
import {Button} from '@openng/optimus-ui/button';
import {UnitFormComponent} from './unit-form-component';
import {UnitMode} from './unit-form';

@Component({
  standalone: true,
  imports: [UnitFormComponent, ReactiveFormsModule],
  template: `
    <app-unit-form-component
      [streets]="streets()"
      [unitTypes]="unitTypes()"
      [unitRoles]="unitRoles()"
      [isLoading]="isLoading()"
    />
  `,
})
class TestHostComponent {
  readonly streets = signal<NeighStreetModel[]>([
    {publicId: 's1', name: 'Calle Reforma'} as NeighStreetModel,
    {publicId: 's2', name: 'Av. Universidad'} as NeighStreetModel,
  ]);
  readonly unitTypes = signal<BaseCatalogModel[]>([
    {publicId: 'ut1', name: 'departamento', displayName: 'Departamento'},
    {publicId: 'ut2', name: 'casa', displayName: 'Casa'},
  ]);
  readonly unitRoles = signal<BaseCatalogModel[]>([
    {publicId: 'ur1', name: 'owner', displayName: 'Propietario'},
    {publicId: 'ur2', name: 'tenant', displayName: 'Inquilino'},
  ]);
  readonly isLoading = signal(false);
}

@Component({
  standalone: true,
  imports: [UnitFormComponent, ReactiveFormsModule, Button],
  template: `
    <form [formGroup]="form">
      <app-unit-form-component
        formControlName="unit"
        [streets]="streets()"
        [unitTypes]="unitTypes()"
        [unitRoles]="unitRoles()"
        [canPickExisting]="canPickExisting()"
        [searchUnits]="searchUnits()"
      />
      <button type="submit" (click)="form.markAllAsTouched()">Submit</button>
    </form>
  `,
})
class CvaHostComponent {
  readonly form = new FormGroup({
    unit: new FormControl<CreateUnit | null>(null),
  });
  readonly canPickExisting = signal(false);
  readonly searchUnits = signal<UnitModel[]>([
    {
      publicId: 'u1',
      identifier: 'A-101',
      street: {name: 'Calle Reforma'} as NeighStreetModel,
      type: {name: 'casa', displayName: 'Casa'} as BaseCatalogModel,
      userUnits: [],
    } as unknown as UnitModel,
  ]);
  readonly streets = signal<NeighStreetModel[]>([{publicId: 's1', name: 'Calle Reforma'} as NeighStreetModel]);
  readonly unitTypes = signal<BaseCatalogModel[]>([
    {publicId: 'ut1', name: 'departamento', displayName: 'Departamento'},
  ]);
  readonly unitRoles = signal<BaseCatalogModel[]>([
    {publicId: 'ur1', name: 'owner', displayName: 'Propietario'},
  ]);
}

function getUnitFormComponent(fixture: ComponentFixture<unknown>): UnitFormComponent {
  return fixture.debugElement.query(By.directive(UnitFormComponent)).componentInstance;
}

function clickButtonByLabel(fixture: ComponentFixture<unknown>, label: string): void {
  const buttons = Array.from(
    fixture.nativeElement.querySelectorAll('button'),
  ) as HTMLButtonElement[];
  const target = buttons.find((button) => button.textContent?.includes(label));
  expect(target).toBeTruthy();
  target?.click();
  fixture.detectChanges();
}

describe('UnitFormComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should initialize form with default values from first items', () => {
    const component = getUnitFormComponent(fixture);
    expect(component.form.value.unitTypeId).toBe('ut1');
    expect(component.form.value.unitRoleId).toBe('ur1');
    expect(component.form.value.isCurrentOccupant).toBe(true);
  });

  it('should default to create mode without canPickExisting', () => {
    const component = getUnitFormComponent(fixture);
    expect(component.mode()).toBe('create');
  });

  it('should render street select options', () => {
    const options = fixture.nativeElement.querySelectorAll('p-select');
    expect(options.length).toBeGreaterThanOrEqual(1);
  });

  it('should render unit type cards', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button[type="button"]');
    expect(buttons.length).toBe(2);
  });

  it('should mark form as invalid when required fields are empty', () => {
    const component = getUnitFormComponent(fixture);
    component.form.controls.streetId.setValue('');
    component.form.controls.unitIdentifier.setValue('');
    component.form.controls.unitRoleId.setValue('');
    expect(component.form.invalid).toBe(true);
  });

  it('should emit doSubmit when form is valid and submitted', () => {
    const component = getUnitFormComponent(fixture);
    const spy = jest.fn();
    component.doSubmit.subscribe(spy);

    component.form.controls.streetId.setValue('s1');
    component.form.controls.unitIdentifier.setValue('#101');
    component.form.controls.unitRoleId.setValue('ur1');
    component.onSubmit();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit a create payload without a unitId on doSubmit', () => {
    const component = getUnitFormComponent(fixture);
    const spy = jest.fn();
    component.doSubmit.subscribe(spy);

    component.form.controls.streetId.setValue('s1');
    component.form.controls.unitIdentifier.setValue('#101');
    component.form.controls.unitRoleId.setValue('ur1');
    component.onSubmit();

    expect(spy).toHaveBeenCalledWith(
      expect.not.objectContaining({unitId: expect.anything()}),
    );
  });

  it('should not emit doSubmit when form is invalid', () => {
    const component = getUnitFormComponent(fixture);
    const spy = jest.fn();
    component.doSubmit.subscribe(spy);

    component.form.controls.streetId.setValue('');
    component.onSubmit();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should allow switching unit type via card click', () => {
    const component = getUnitFormComponent(fixture);
    const buttons = fixture.nativeElement.querySelectorAll('button[type="button"]');
    buttons[1].click();
    fixture.detectChanges();

    expect(component.form.value.unitTypeId).toBe('ut2');
  });

  it('should render content projection slot', () => {
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy();
  });
});

describe('UnitFormComponent (CVA integration with formControlName)', () => {
  let hostComponent: CvaHostComponent;
  let fixture: ComponentFixture<CvaHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvaHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CvaHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should instantiate without circular dependency (NG0200)', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should propagate values to the parent control when inner form changes', () => {
    const component = getUnitFormComponent(fixture);
    component.form.controls.streetId.setValue('s1');
    component.form.controls.unitIdentifier.setValue('#101');
    component.form.controls.unitRoleId.setValue('ur1');
    fixture.detectChanges();

    const parentValue = hostComponent.form.controls.unit.value;
    expect(parentValue).toEqual(
      expect.objectContaining({
        streetId: 's1',
        unitIdentifier: '#101',
        unitRoleId: 'ur1',
      }),
    );
  });

  it('should show validation errors when the parent control is touched', () => {
    const errorElsBefore = fixture.nativeElement.querySelectorAll('app-form-validation-error small');
    expect(errorElsBefore.length).toBe(0);

    hostComponent.form.markAllAsTouched();
    fixture.detectChanges();

    const errorElsAfter = fixture.nativeElement.querySelectorAll('app-form-validation-error small');
    expect(errorElsAfter.length).toBeGreaterThan(0);
  });

  it('should use the value provided by writeValue for the parent control', () => {
    hostComponent.form.controls.unit.setValue({
      streetId: 's1',
      unitTypeId: 'ut1',
      unitIdentifier: '#101',
      unitRoleId: 'ur1',
      isCurrentOccupant: false,
    });
    fixture.detectChanges();

    const component = getUnitFormComponent(fixture);
    expect(component.form.value.streetId).toBe('s1');
    expect(component.form.value.isCurrentOccupant).toBe(false);
  });
});

describe('UnitFormComponent (existing unit mode)', () => {
  let hostComponent: CvaHostComponent;
  let fixture: ComponentFixture<CvaHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvaHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CvaHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.canPickExisting.set(true);
    fixture.detectChanges();
  });

  it('should hide the mode toggle when canPickExisting is false', () => {
    hostComponent.canPickExisting.set(false);
    fixture.detectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.some((button) => button.textContent?.includes('Buscar existente'))).toBe(false);
  });

  it('should switch to existing mode via the toggle', () => {
    const component = getUnitFormComponent(fixture);
    clickButtonByLabel(fixture, 'Buscar existente');
    expect(component.mode()).toBe('existing');
  });

  it('should require a unit selection in existing mode', () => {
    const component = getUnitFormComponent(fixture);
    component.setMode('existing');
    fixture.detectChanges();
    expect(component.form.controls.unitId.invalid).toBe(true);
  });

  it('should propagate a unitId payload to the parent control in existing mode', () => {
    const component = getUnitFormComponent(fixture);
    component.setMode('existing');
    fixture.detectChanges();
    component.form.controls.unitId.setValue('u1');
    component.form.controls.unitRoleId.setValue('ur1');
    fixture.detectChanges();

    const parentValue = hostComponent.form.controls.unit.value;
    expect(parentValue).toEqual(
      expect.objectContaining({
        unitId: 'u1',
        unitRoleId: 'ur1',
        isCurrentOccupant: true,
      }),
    );
    expect(parentValue).not.toHaveProperty('streetId');
  });

  it('should switch back to create mode and emit create fields', () => {
    const component = getUnitFormComponent(fixture);
    component.setMode('existing');
    fixture.detectChanges();
    component.form.controls.unitId.setValue('u1');
    component.setMode('create');
    fixture.detectChanges();

    const parentValue = hostComponent.form.controls.unit.value;
    expect(parentValue).not.toHaveProperty('unitId');
    expect(parentValue).toEqual(expect.any(Object));
  });

  it('should restore existing mode when writeValue provides a unitId', () => {
    hostComponent.form.controls.unit.setValue({
      unitId: 'u1',
      unitRoleId: 'ur1',
      isCurrentOccupant: false,
    });
    fixture.detectChanges();

    const component = getUnitFormComponent(fixture);
    expect(component.mode()).toBe('existing');
    expect(component.form.value.unitId).toBe('u1');
    expect(component.form.value.isCurrentOccupant).toBe(false);
  });
});