import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpRequest,
  HttpInterceptorFn,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ErrorInterceptor } from './request-error-interceptor';
import { AuthService } from '@auth/services';
import { AuthStore } from '@auth/store';
import { ErrorService } from '@core/services/error-service';

describe('ErrorInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => ErrorInterceptor(req, next));

  const makeRequest = (url = '/api/some-data') => new HttpRequest('GET', url);

  let refreshSession: jest.Mock;
  let loadSession: jest.Mock;
  let clearSession: jest.Mock;
  let handleError: jest.Mock;

  const unauthorized = () =>
    throwError(() => new HttpErrorResponse({ status: 401 }));

  const serverError = () =>
    throwError(() => new HttpErrorResponse({ status: 500 }));

  beforeEach(() => {
    refreshSession = jest.fn();
    loadSession = jest.fn();
    clearSession = jest.fn();
    handleError = jest.fn(() => throwError(() => new Error('handled')));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { refreshSession } },
        { provide: AuthStore, useValue: { loadSession, clearSession } },
        { provide: ErrorService, useValue: { handleError } },
      ],
    });
  });

  describe('skipped endpoints', () => {
    const skipUrlCases = [
      { url: '/api/auth/refresh', label: 'refresh' },
      { url: '/api/auth/login', label: 'login' },
      { url: '/api/auth/reset-password', label: 'reset-password' },
      { url: '/api/auth/code-validation', label: 'code-validation' },
      { url: '/api/auth/pwd-recovery-request', label: 'pwd-recovery-request' },
    ];

    it.each(skipUrlCases)(
      'should not refresh when $label returns 401',
      ({ url }) => {
        const next = jest.fn(() => unauthorized());

        interceptor(makeRequest(url), next).subscribe({
          error: () => {
            expect(refreshSession).not.toHaveBeenCalled();
            expect(handleError).toHaveBeenCalled();
          },
        });
      },
    );
  });

  it('should refresh and retry the request with the new token on 401', (done) => {
    refreshSession.mockReturnValue(of({ data: { token: 'new-token' } }));

    const next = jest
      .fn<(req: HttpRequest<unknown>) => any>()
      .mockReturnValueOnce(unauthorized())
      .mockReturnValueOnce(of('retried'));

    interceptor(makeRequest(), next).subscribe({
      next: () => {
        expect(refreshSession).toHaveBeenCalledTimes(1);
        expect(loadSession).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(2);
        const retried = next.mock.calls[1][0] as HttpRequest<unknown>;
        expect(retried.headers.get('Authorization')).toBe('Bearer new-token');
        done();
      },
    });
  });

  it('should clear the session when the refresh itself fails', (done) => {
    refreshSession.mockReturnValue(throwError(() => new Error('expired')));

    const next = jest.fn(() => unauthorized());

    interceptor(makeRequest(), next).subscribe({
      error: () => {
        expect(clearSession).toHaveBeenCalled();
        expect(loadSession).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should delegate non-401 errors to the ErrorService', (done) => {
    handleError.mockReturnValue(throwError(() => new Error('delegated')));
    const next = jest.fn(() => serverError());

    interceptor(makeRequest(), next).subscribe({
      error: (err: Error) => {
        expect(err.message).toBe('delegated');
        expect(handleError).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });
});