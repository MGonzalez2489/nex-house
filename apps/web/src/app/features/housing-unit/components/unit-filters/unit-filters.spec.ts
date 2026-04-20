import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitFilters } from './unit-filters';

describe('UnitFilters', () => {
  let component: UnitFilters;
  let fixture: ComponentFixture<UnitFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
