import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth-interceptor';
import { APP_CONSTANTS } from '@core/constants';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  const buildNext = jest.fn((req: HttpRequest<unknown>) => of(req));

  const makeRequest = () =>
    new HttpRequest('GET', '/api/some-data');

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    buildNext.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should attach the standard token when present', (done) => {
    localStorage.setItem(APP_CONSTANTS.TOKEN_STORAGE_KEY, 'access-token');

    interceptor(makeRequest(), buildNext).subscribe((req: any) => {
      expect(req.headers.get('Authorization')).toBe('Bearer access-token');
      done();
    });
  });

  it('should fall back to the password reset token when no session token exists', (done) => {
    localStorage.setItem(APP_CONSTANTS.TOKEN_RESET_PWD, 'reset-token');

    interceptor(makeRequest(), buildNext).subscribe((req: any) => {
      expect(req.headers.get('Authorization')).toBe('Bearer reset-token');
      done();
    });
  });

  it('should prefer the standard token over the reset token when both exist', (done) => {
    localStorage.setItem(APP_CONSTANTS.TOKEN_STORAGE_KEY, 'access-token');
    localStorage.setItem(APP_CONSTANTS.TOKEN_RESET_PWD, 'reset-token');

    interceptor(makeRequest(), buildNext).subscribe((req: any) => {
      expect(req.headers.get('Authorization')).toBe('Bearer access-token');
      done();
    });
  });

  it('should forward the request untouched when no token is stored', (done) => {
    interceptor(makeRequest(), buildNext).subscribe((req: any) => {
      expect(req.headers.get('Authorization')).toBeNull();
      done();
    });
  });
});