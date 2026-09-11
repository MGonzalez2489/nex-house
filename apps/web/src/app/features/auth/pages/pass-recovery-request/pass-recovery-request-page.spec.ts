import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PassRecoveryRequestPage} from './pass-recovery-request-page';

describe('PassRecoveryRequestPage', () => {
  let component: PassRecoveryRequestPage;
  let fixture: ComponentFixture<PassRecoveryRequestPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassRecoveryRequestPage],
    }).compileComponents();

    fixture = TestBed.createComponent(PassRecoveryRequestPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
