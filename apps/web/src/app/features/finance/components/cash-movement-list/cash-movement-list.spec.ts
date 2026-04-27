import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashMovementList } from './cash-movement-list';

describe('CashMovementList', () => {
  let component: CashMovementList;
  let fixture: ComponentFixture<CashMovementList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashMovementList],
    }).compileComponents();

    fixture = TestBed.createComponent(CashMovementList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
