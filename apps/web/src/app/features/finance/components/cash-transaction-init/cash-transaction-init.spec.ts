import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashTransactionInit } from './cash-transaction-init';

describe('CashTransactionInit', () => {
  let component: CashTransactionInit;
  let fixture: ComponentFixture<CashTransactionInit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashTransactionInit],
    }).compileComponents();

    fixture = TestBed.createComponent(CashTransactionInit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
