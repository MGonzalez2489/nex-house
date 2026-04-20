import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashFilters } from './cash-filters';

describe('CashFilters', () => {
  let component: CashFilters;
  let fixture: ComponentFixture<CashFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(CashFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
