import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {AuthStore} from '@auth/store';
import {StartupStore} from '@stores/startup.store';
import {PassRecoveryPage} from './pass-recovery-page';

describe('PassRecoveryPage', () => {
  let component: PassRecoveryPage;
  let fixture: ComponentFixture<PassRecoveryPage>;
  let resetPwd: jest.Mock;
  let armLoading: jest.Mock;
  let navigateByUrl: jest.Mock;

  beforeEach(async () => {
    resetPwd = jest.fn().mockResolvedValue(true);
    armLoading = jest.fn();
    navigateByUrl = jest.fn();

    await TestBed.configureTestingModule({
      imports: [PassRecoveryPage],
      providers: [
        {provide: Router, useValue: {navigateByUrl}},
        {
          provide: AuthStore,
          useValue: {
            resetPwd,
            loading: () => false,
            callState: () => 'idle',
          },
        },
        {
          provide: StartupStore,
          useValue: {armLoading},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PassRecoveryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with an empty form so the user must type a new password', () => {
    expect(component.form.controls.password.value).toBe('');
    expect(component.form.controls.confirmPassword.value).toBe('');
    expect(component.form.valid).toBe(false);
  });

  it('resets the password and navigates to the dashboard on success', async () => {
    component.form.controls.password.setValue('new-secret');
    component.form.controls.confirmPassword.setValue('new-secret');
    await component.doSubmit();

    expect(resetPwd).toHaveBeenCalledWith('new-secret');
    expect(armLoading).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('does not submit when the passwords do not match', async () => {
    component.form.controls.password.setValue('new-secret');
    component.form.controls.confirmPassword.setValue('different-secret');
    await component.doSubmit();

    expect(component.form.invalid).toBe(true);
    expect(resetPwd).not.toHaveBeenCalled();
    expect(armLoading).not.toHaveBeenCalled();
  });

  it('does not submit when either password is too short', async () => {
    component.form.markAllAsTouched();
    component.form.controls.password.setValue('x');
    component.form.controls.confirmPassword.setValue('x');
    await component.doSubmit();

    expect(resetPwd).not.toHaveBeenCalled();
  });

  it('does not navigate when the reset request fails', async () => {
    resetPwd.mockResolvedValue(false);
    component.form.controls.password.setValue('new-secret');
    component.form.controls.confirmPassword.setValue('new-secret');
    await component.doSubmit();

    expect(armLoading).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});