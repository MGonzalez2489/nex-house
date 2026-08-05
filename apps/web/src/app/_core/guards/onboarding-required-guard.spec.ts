import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { onboardingRequiredGuard } from './onboarding-required-guard';

describe('onboardingRequiredGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => onboardingRequiredGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
