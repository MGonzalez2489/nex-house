import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashMovement } from './cash-movement';

describe('CashMovement', () => {
  let component: CashMovement;
  let fixture: ComponentFixture<CashMovement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashMovement],
    }).compileComponents();

    fixture = TestBed.createComponent(CashMovement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
