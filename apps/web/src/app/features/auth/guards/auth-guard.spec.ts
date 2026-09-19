import {TestBed} from '@angular/core/testing';
import {provideRouter, UrlTree} from '@angular/router';
import {AuthStore} from '@auth/store';

import {AuthGuard} from './auth-guard';

describe('AuthGuard', () => {
  let isAuthenticated: jest.Mock;

  const runGuard = () => TestBed.runInInjectionContext(() => AuthGuard());

  beforeEach(() => {
    isAuthenticated = jest.fn().mockReturnValue(false);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), {provide: AuthStore, useValue: {isAuthenticated}}],
    });
  });

  it('should be created', () => {
    expect(AuthGuard).toBeTruthy();
  });

  it('allows navigation when the session is authenticated', () => {
    isAuthenticated.mockReturnValue(true);

    expect(runGuard()).toBe(true);
  });

  it('redirects to the absolute /auth/login url when the session is not authenticated', () => {
    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/auth/login');
  });
});
