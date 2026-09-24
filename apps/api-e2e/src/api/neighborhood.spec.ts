import axios from 'axios';
import {
  authHeaders,
  createNeighborhood,
  expectEnvelope,
  login,
  newIdempotencyKey,
  unique,
  getChihuahuaCityId,
} from '../support/helpers';

describe('Neighborhoods', () => {
  let token: string;
  let cityId: string;

  beforeAll(async () => {
    const session = await login();
    token = session.token;
    cityId = await getChihuahuaCityId(token);
  });

  it('requires an idempotency key on creation (400)', async () => {
    const res = await axios.post(
      '/api/neighborhood',
      {
        name: unique('neigh'),
        adminEmail: unique('admin'),
        streets: [{ name: 'calle principal' }],
        isActive: true,
        zipCode: '31000',
        cityId,
      },
      { headers: authHeaders(token) },
    );
    expectEnvelope(res, 400);
  });

  it('creates a neighborhood atomically with its admin and streets', async () => {
    const fixture = await createNeighborhood(token);
    const { neighborhood } = fixture;

    expect(neighborhood.publicId).toEqual(expect.any(String));
    expect(neighborhood.name).toBe(fixture.name);
    expect(neighborhood.isActive).toBe(true);
    expect(neighborhood.streets.length).toBe(1);
    expect(neighborhood.streets[0].name).toBe('calle principal');
    expect(neighborhood.address.city.publicId).toBe(cityId);
  });

  it('rejects a duplicated admin email (409)', async () => {
    const fixture = await createNeighborhood(token);
    const res = await axios.post(
      '/api/neighborhood',
      {
        name: unique('neigh'),
        adminEmail: fixture.adminEmail,
        streets: [{ name: 'otra calle' }],
        isActive: true,
        zipCode: '31000',
        cityId,
      },
      { headers: { ...authHeaders(token), 'X-Idempotency-Key': newIdempotencyKey() } },
    );
    expectEnvelope(res, 409);
    expect(res.data.message).toContain('already exists');
  });

  it('rejects an empty streets array (400)', async () => {
    const res = await axios.post(
      '/api/neighborhood',
      {
        name: unique('neigh'),
        adminEmail: unique('admin'),
        streets: [],
        isActive: true,
        zipCode: '31000',
        cityId,
      },
      { headers: { ...authHeaders(token), 'X-Idempotency-Key': newIdempotencyKey() } },
    );
    expectEnvelope(res, 400);
  });

  it('lists neighborhoods with pagination metadata', async () => {
    const res = await axios.get('/api/neighborhood', {
      headers: authHeaders(token),
      params: { rows: 1 },
    });
    expectEnvelope(res, 200);
    expect(res.data.meta).toMatchObject({
      page: expect.any(Number),
      limit: 1,
      total: expect.any(Number),
      lastPage: expect.any(Number),
    });
  });

  it('returns a single neighborhood by publicId', async () => {
    const fixture = await createNeighborhood(token);
    const res = await axios.get(`/api/neighborhood/${fixture.neighborhood.publicId}`, {
      headers: authHeaders(token),
    });
    expectEnvelope(res, 200);
    expect(res.data.data.publicId).toBe(fixture.neighborhood.publicId);
    expect(res.data.data.streets.length).toBeGreaterThan(0);
  });

  it('returns 404 for an unknown neighborhood', async () => {
    const res = await axios.get(
      '/api/neighborhood/00000000-0000-4000-8000-000000000000',
      { headers: authHeaders(token) },
    );
    expectEnvelope(res, 404);
  });

  describe('super_admin scope (no assigned neighborhood)', () => {
    it('fails /neighborhood/mine (known latent bug: 500)', async () => {
      const res = await axios.get('/api/neighborhood/mine', {
        headers: authHeaders(token),
      });
      // Neighborhood assigned to nobody -> findById(null) crashes downstream.
      expect(res.status).toBe(500);
    });

    it('lists streets with empty pagination instead of a neighborhood', async () => {
      const res = await axios.get('/api/neighborhood/streets', {
        headers: authHeaders(token),
      });
      expectEnvelope(res, 200);
      expect(res.data.data).toEqual([]);
      expect(res.data.meta.total).toBe(0);
    });
  });

  it('requires authentication (401)', async () => {
    const res = await axios.get('/api/neighborhood');
    expectEnvelope(res, 401);
  });
});