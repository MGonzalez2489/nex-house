import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthStore} from '@auth/store';
import {PassRecoveryRequestPage} from './pass-recovery-request-page';

describe('PassRecoveryRequestPage', () => {
  let component: PassRecoveryRequestPage;
  let fixture: ComponentFixture<PassRecoveryRequestPage>;
  let pwdRecoveryRequest: jest.Mock;
  let navigateByUrl: jest.Mock;

  beforeEach(async () => {
    pwdRecoveryRequest = jest.fn().mockResolvedValue(true);
    navigateByUrl = jest.fn();

    await TestBed.configureTestingModule({
      imports: [PassRecoveryRequestPage],
      providers: [
        {provide: Router, useValue: {navigateByUrl}},
        {provide: ActivatedRoute, useValue: {}},
        {
          provide: AuthStore,
          useValue: {
            pwdRecoveryRequest,
            loading: () => false,
            callState: () => 'idle',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PassRecoveryRequestPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requests a code and navigates to the code validation route on success', async () => {
    component.form.controls.email.setValue('resident@nexhouse.com');
    await component.onSubmit();

    expect(pwdRecoveryRequest).toHaveBeenCalledWith('resident@nexhouse.com');
    expect(navigateByUrl).toHaveBeenCalledWith('/auth/validate-code');
  });

  it('does not request a code when an invalid email is submitted', async () => {
    component.form.controls.email.setValue('not-an-email');
    await component.onSubmit();

    expect(pwdRecoveryRequest).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('does not request a code when the request fails', async () => {
    pwdRecoveryRequest.mockResolvedValue(false);
    component.form.controls.email.setValue('resident@nexhouse.com');
    await component.onSubmit();

    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});