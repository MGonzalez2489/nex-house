import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashTransactionsTable } from './cash-transactions-table';

describe('CashTransactionsTable', () => {
  let component: CashTransactionsTable;
  let fixture: ComponentFixture<CashTransactionsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashTransactionsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(CashTransactionsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
