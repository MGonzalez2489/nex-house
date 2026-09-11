import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {AuthStore} from '@auth/store';
import {PassCodeValidatePage} from './pass-code-validate-page';

describe('PassCodeValidatePage', () => {
  let component: PassCodeValidatePage;
  let fixture: ComponentFixture<PassCodeValidatePage>;
  let codeValidation: jest.Mock;
  let navigateByUrl: jest.Mock;

  beforeEach(async () => {
    codeValidation = jest.fn().mockResolvedValue(true);
    navigateByUrl = jest.fn();

    await TestBed.configureTestingModule({
      imports: [PassCodeValidatePage],
      providers: [
        {provide: Router, useValue: {navigateByUrl}},
        {
          provide: AuthStore,
          useValue: {
            recoveryCode: () => 'ABC-123456',
            codeValidation,
            loading: () => false,
            callState: () => 'idle',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PassCodeValidatePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prefills the code control from the store', () => {
    expect(component.form.controls.code.value).toBe('ABC-123456');
  });

  it('validates the code and navigates to the reset password route on success', async () => {
    await component.onSubmit();

    expect(codeValidation).toHaveBeenCalledWith('ABC-123456');
    expect(navigateByUrl).toHaveBeenCalledWith('/auth/password-recovery');
  });

  it('does not submit codes that do not match the AAA-###### pattern', async () => {
    component.form.controls.code.setValue('BAD');
    await component.onSubmit();

    expect(component.form.invalid).toBe(true);
    expect(codeValidation).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('does not navigate when the validation request fails', async () => {
    codeValidation.mockResolvedValue(false);
    await component.onSubmit();

    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});