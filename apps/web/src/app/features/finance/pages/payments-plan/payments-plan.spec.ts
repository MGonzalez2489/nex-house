import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsPlan } from './payments-plan';

describe('PaymentsPlan', () => {
  let component: PaymentsPlan;
  let fixture: ComponentFixture<PaymentsPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsPlan],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsPlan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
