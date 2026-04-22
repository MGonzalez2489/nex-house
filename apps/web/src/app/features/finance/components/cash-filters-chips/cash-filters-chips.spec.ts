import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashFiltersChips } from './cash-filters-chips';

describe('CashFiltersChips', () => {
  let component: CashFiltersChips;
  let fixture: ComponentFixture<CashFiltersChips>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashFiltersChips],
    }).compileComponents();

    fixture = TestBed.createComponent(CashFiltersChips);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
