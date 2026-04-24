import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionCategorySelect } from './transaction-category-select';

describe('TransactionCategorySelect', () => {
  let component: TransactionCategorySelect;
  let fixture: ComponentFixture<TransactionCategorySelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionCategorySelect],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionCategorySelect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
