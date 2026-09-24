import axios from 'axios';
import {
  authHeaders,
  expectEnvelope,
  login,
  unique,
} from '../support/helpers';

describe('User & profile', () => {
  let token: string;

  beforeAll(async () => {
    const session = await login();
    token = session.token;
  });

  it('returns the authenticated session user', async () => {
    const res = await axios.get('/api/user', {
      headers: authHeaders(token),
    });
    expectEnvelope(res, 200);
    expect(res.data.data.email).toBe('root@test.com');
    expect(res.data.data.role.name).toBe('super_admin');
    expect(res.data.data.status.name).toBe('active');
  });

  it('returns the onboarding status of a seeded (active) user', async () => {
    const res = await axios.get('/api/onboarding/status', {
      headers: authHeaders(token),
    });
    expectEnvelope(res, 200);
    expect(res.data.data).toMatchObject({
      isCompleted: true,
      currentStepId: expect.any(String),
      steps: expect.any(Array),
    });
  });

  it('updates the profile via multipart form data', async () => {
    const firstName = `E2E-${unique('fn')}`;
    const form = new FormData();
    form.append('firstName', firstName);

    const res = await axios.patch('/api/user/profile', form, {
      headers: authHeaders(token),
    });
    expectEnvelope(res, 200);
    expect(res.data.data.firstName).toBe(firstName);
  });

  // Known latent bug: UserController stats/PATCH require CurrentNeigh, and the
  // super_admin has no neighborhood assigned, so neigh.id crashes (500).
  describe('super_admin without a neighborhood (known latent bugs)', () => {
    it.todo('/user/stats 500 — see UserStatsService.getStats(neigh.id)');

    it.todo('PATCH /user 500 — see UserService.update(neigh.id, ...)');
  });
});