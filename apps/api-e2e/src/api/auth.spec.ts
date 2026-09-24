import axios from 'axios';
import {
  authHeaders,
  cookieHeaders,
  createNeighborhood,
  expectEnvelope,
  login,
  loginRaw,
  refreshTokenFrom,
  STRONG_PWD,
  DEFAULT_PWD,
} from '../support/helpers';

describe('Auth & sessions', () => {
  it('logs in with valid credentials', async () => {
    const session = await login();
    expect(session.user.role.name).toBe('super_admin');
  });

  it('rejects wrong credentials with 401', async () => {
    const res = await axios.post('/api/auth/login', {
      email: 'root@test.com',
      password: 'wrong-password',
    });
    expectEnvelope(res, 401);
  });

  it('rejects unknown emails with 401', async () => {
    const res = await axios.post('/api/auth/login', {
      email: 'ghost@test.com',
      password: 'whatever',
    });
    expectEnvelope(res, 401);
  });

  it('validates the request body (400)', async () => {
    const res = await axios.post('/api/auth/login', {});
    expectEnvelope(res, 400);
  });

  describe('refresh & logout', () => {
    it('rotates the refresh token on each refresh', async () => {
      const res = await loginRaw();
      const firstCookie = refreshTokenFrom(res);

      // Revoked cookies must be rejected.
      const firstRefresh = await axios.post(
        '/api/auth/refresh',
        {},
        { headers: cookieHeaders(firstCookie) },
      );
      expectEnvelope(firstRefresh, 200);

      const secondCookie = refreshTokenFrom(firstRefresh);
      const staleReplay = await axios.post(
        '/api/auth/refresh',
        {},
        { headers: cookieHeaders(firstCookie) },
      );
      expectEnvelope(staleReplay, 401);

      const secondRefresh = await axios.post(
        '/api/auth/refresh',
        {},
        { headers: cookieHeaders(secondCookie) },
      );
      expectEnvelope(secondRefresh, 200);
    });

    it('requires a refresh token (401)', async () => {
      const res = await axios.post('/api/auth/refresh', {});
      expectEnvelope(res, 401);
    });

    it('revokes the session on logout', async () => {
      const res = await loginRaw();
      const cookie = refreshTokenFrom(res);
      const { token } = res.data.data;

      const logout = await axios.post(
        '/api/auth/logout',
        {},
        {
          headers: {
            ...authHeaders(token as string),
            ...cookieHeaders(cookie),
          },
        },
      );
      expectEnvelope(logout, 200);

      const reuse = await axios.post(
        '/api/auth/refresh',
        {},
        { headers: cookieHeaders(cookie) },
      );
      expectEnvelope(reuse, 401);
    });
  });

  describe('password recovery flow', () => {
    let adminEmail: string;

    beforeAll(async () => {
      const superAdmin = await login();
      const fixture = await createNeighborhood(superAdmin.token);
      adminEmail = fixture.adminEmail;
    });

    it('moves the user to PASSWORD_RECOVERY and returns a dev code', async () => {
      const res = await axios.post('/api/auth/pwd-recovery-request', {
        email: adminEmail,
      });
      expectEnvelope(res, 200);
      expect(res.data.data.code).toMatch(/^[A-Z]{3}-\d{6}$/);
    });

    it('validates the code', async () => {
      const request = await axios.post('/api/auth/pwd-recovery-request', {
        email: adminEmail,
      });
      const { code } = request.data.data;

      const res = await axios.post('/api/auth/code-validation', { code });
      expectEnvelope(res, 200);
      // The reset credential is returned as `token` and must be presented in the
      // Authorization header (ResetPwdGuard validates the Bearer token).
      expect(res.data.data.token).toEqual(expect.any(String));
      expect(res.data.data.exp).toEqual(expect.any(Number));
    });

    it('rejects an invalid code (400)', async () => {
      const res = await axios.post('/api/auth/code-validation', {
        code: 'ABC-000000',
      });
      expectEnvelope(res, 400);
    });

    it('rejects weak passwords but allows a strong one', async () => {
      const request = await axios.post('/api/auth/pwd-recovery-request', {
        email: adminEmail,
      });
      const validate = await axios.post('/api/auth/code-validation', {
        code: request.data.data.code,
      });
      const auth = { Authorization: `Bearer ${validate.data.data.token}` };

      const weak = await axios.post(
        '/api/auth/reset-password',
        { pwd: '1234' },
        { headers: auth },
      );
      expectEnvelope(weak, 400);

      const reset = await axios.post(
        '/api/auth/reset-password',
        { pwd: STRONG_PWD },
        { headers: auth },
      );
      expectEnvelope(reset, 200);
    });

    it('accepts the new password and rejects the old one', async () => {
      const request = await axios.post('/api/auth/pwd-recovery-request', {
        email: adminEmail,
      });
      const validate = await axios.post('/api/auth/code-validation', {
        code: request.data.data.code,
      });
      await axios.post(
        '/api/auth/reset-password',
        { pwd: STRONG_PWD },
        { headers: { Authorization: `Bearer ${validate.data.data.token}` } },
      );

      const withNew = await axios.post('/api/auth/login', {
        email: adminEmail,
        password: STRONG_PWD,
      });
      expectEnvelope(withNew, 200);

      const withOld = await axios.post('/api/auth/login', {
        email: adminEmail,
        password: DEFAULT_PWD,
      });
      expectEnvelope(withOld, 401);
    });
  });
});