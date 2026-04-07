import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsMonitor } from './payments-monitor';

describe('PaymentsMonitor', () => {
  let component: PaymentsMonitor;
  let fixture: ComponentFixture<PaymentsMonitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsMonitor],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsMonitor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
