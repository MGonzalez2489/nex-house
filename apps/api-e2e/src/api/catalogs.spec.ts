import axios from 'axios';
import {
  authHeaders,
  expectEnvelope,
  login,
} from '../support/helpers';

describe('Catalogs', () => {
  let token: string;

  beforeAll(async () => {
    const session = await login();
    token = session.token;
  });

  it('requires authentication (401)', async () => {
    const res = await axios.get('/api/catalogs/countries');
    expectEnvelope(res, 401);
  });

  const catalogPaths = [
    'countries',
    'unit_types',
    'user_roles',
    'user_unit_roles',
    'unit_statuses',
    'user_statuses',
  ];

  it.each(catalogPaths)('serves %s', async (path) => {
    const res = await axios.get(`/api/catalogs/${path}`, {
      headers: authHeaders(token),
    });
    expectEnvelope(res, 200);
    expect(Array.isArray(res.data.data)).toBe(true);
    for (const item of res.data.data) {
      expect(item.publicId).toEqual(expect.any(String));
      expect(typeof item.name).toBe('string');
    }
  });

  it('returns admin/resident roles but never super_admin in the user_roles catalog', async () => {
    const roles = await axios.get('/api/catalogs/user_roles', {
      headers: authHeaders(token),
    });
    const names = roles.data.data.map((r: { name: string }) => r.name);
    expect(names).toContain('admin');
    expect(names).toContain('resident');
    expect(names).not.toContain('super_admin');
  });

  it('exposes the location hierarchy (countries -> states -> cities)', async () => {
    const countries = await axios.get('/api/catalogs/countries', {
      headers: authHeaders(token),
    });
    const mx = countries.data.data.find((c: { code: string }) => c.code === 'MX');
    expect(mx).toBeTruthy();
    expect(mx.displayName).toBe('México');

    const states = await axios.get(`/api/catalogs/states/${mx.publicId}`, {
      headers: authHeaders(token),
    });
    const chh = states.data.data.find((s: { code: string }) => s.code === 'CHH');
    expect(chh).toBeTruthy();
    expect(chh.displayName).toContain('Chihuahua');

    const cities = await axios.get(`/api/catalogs/cities/${chh.publicId}`, {
      headers: authHeaders(token),
    });
    expect(cities.data.data.length).toBeGreaterThan(0);
  });

  it('returns 404 for unknown location parent ids', async () => {
    const bogus = '00000000-0000-4000-8000-000000000000';
    const states = await axios.get(`/api/catalogs/states/${bogus}`, {
      headers: authHeaders(token),
    });
    expectEnvelope(states, 404);
  });
});