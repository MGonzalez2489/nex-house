import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashSummary } from './cash-summary';

describe('CashSummary', () => {
  let component: CashSummary;
  let fixture: ComponentFixture<CashSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(CashSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
