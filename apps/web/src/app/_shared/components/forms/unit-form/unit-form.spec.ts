import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitForm } from './unit-form';

describe('UnitForm', () => {
  let component: UnitForm;
  let fixture: ComponentFixture<UnitForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitForm],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
