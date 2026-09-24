import axios from 'axios';
import { authHeaders, expectEnvelope, login } from '../support/helpers';

describe('Smoke — API surface & security boundary', () => {
  it('rejects protected routes without a token (401)', async () => {
    const res = await axios.get('/api/user');
    expectEnvelope(res, 401);
    expect(res.data.data).toBeNull();
  });

  it('rejects a malformed token (401)', async () => {
    const res = await axios.get('/api/user', {
      headers: authHeaders('not-a-real-jwt'),
    });
    expectEnvelope(res, 401);
  });

  it('wraps every response in the shared envelope', async () => {
    const session = await login();
    expect(session.token).toEqual(expect.any(String));
    expect(session.refreshToken).toEqual(expect.any(String));
    expect(session.exp).toEqual(expect.any(Number));
    expect(session.user.email).toBe('root@test.com');
  });
});