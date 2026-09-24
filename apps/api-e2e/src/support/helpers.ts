/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto';
import axios, { AxiosResponse } from 'axios';

export const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_USER ?? 'root@test.com';
export const SUPER_ADMIN_PWD = process.env.SUPER_ADMIN_PWD ?? '1234';
export const DEFAULT_PWD = '1234';
export const STRONG_PWD = 'NexHouse!1234';

export interface Session {
  token: string;
  refreshToken: string;
  exp: number;
  user: any;
}

export interface NeighborhoodFixture {
  neighborhood: any;
  adminEmail: string;
  name: string;
}

export interface UnitFixture {
  streetId: string;
  unitTypeId: string;
  unitRoleId: string;
  unitIdentifier: string;
  isCurrentOccupant: boolean;
}

let seq = 0;

/** Unique-ifies emails, names and identifiers across runs (DB is never cleaned). */
export const unique = (prefix: string): string =>
  `${prefix}-${Date.now()}-${++seq}`;

export const uniqueEmail = (prefix: string): string =>
  `${unique(prefix)}@nexhouse.test`;

export const newIdempotencyKey = (): string => randomUUID();

/** Returns the raw `refresh_token` cookie value from a login/refresh response. */
export function refreshTokenFrom(res: AxiosResponse): string {
  const setCookie = res.headers['set-cookie'];
  const list = Array.isArray(setCookie) ? setCookie : [setCookie];
  const cookie = list.find((c) => c && c.startsWith('refresh_token='));
  if (!cookie) {
    throw new Error('refresh_token cookie not found in response headers.');
  }
  return cookie.split(';')[0].slice('refresh_token='.length);
}

export const authHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});

export const cookieHeaders = (refreshToken: string): Record<string, string> => ({
  Cookie: `refresh_token=${refreshToken}`,
});

export const expectEnvelope = (res: AxiosResponse, status: number): void => {
  expect(res.status).toBe(status);
  expect(res.data).toMatchObject({
    message: expect.any(String),
    statusCode: status,
  });
};

/* ---------------------------------------------------------------------------
 * Auth
 * ------------------------------------------------------------------------- */

export async function login(
  email = SUPER_ADMIN_EMAIL,
  password = SUPER_ADMIN_PWD,
): Promise<Session> {
  const res = await axios.post('/api/auth/login', { email, password });
  expectEnvelope(res, 200);
  return res.data.data as Session;
}

/** Login returning the raw response so tests can read set-cookie headers. */
export async function loginRaw(
  email = SUPER_ADMIN_EMAIL,
  password = SUPER_ADMIN_PWD,
): Promise<AxiosResponse> {
  const res = await axios.post('/api/auth/login', { email, password });
  expectEnvelope(res, 200);
  return res;
}

/* ---------------------------------------------------------------------------
 * Catalogs / location fixtures
 * ------------------------------------------------------------------------- */

export async function getCatalogPublicId(
  token: string,
  path: string,
  name: string,
): Promise<string> {
  const res = await axios.get(`/api/catalogs/${path}`, {
    headers: authHeaders(token),
  });
  expectEnvelope(res, 200);
  const found = res.data.data.find((r: any) => r.name === name);
  if (!found) {
    throw new Error(`Catalog '${name}' not found in /catalogs/${path}.`);
  }
  return found.publicId;
}

export async function getChihuahuaCityId(token: string): Promise<string> {
  const countries = await axios.get('/api/catalogs/countries', {
    headers: authHeaders(token),
  });
  expectEnvelope(countries, 200);
  const mx = countries.data.data.find((c: any) => c.code === 'MX');
  if (!mx) {
    throw new Error('Mexico country not seeded.');
  }

  const states = await axios.get(`/api/catalogs/states/${mx.publicId}`, {
    headers: authHeaders(token),
  });
  expectEnvelope(states, 200);
  const chh = states.data.data.find((s: any) => s.code === 'CHH');
  if (!chh) {
    throw new Error('Chihuahua state not seeded.');
  }

  const cities = await axios.get(`/api/catalogs/cities/${chh.publicId}`, {
    headers: authHeaders(token),
  });
  expectEnvelope(cities, 200);
  const city = cities.data.data[0];
  if (!city) {
    throw new Error('No Chihuahua city seeded.');
  }
  return city.publicId;
}

/* ---------------------------------------------------------------------------
 * Domain fixtures
 * ------------------------------------------------------------------------- */

/** Unit payload using the first street of the fixture neighborhood. */
export async function buildUnitFixture(
  token: string,
  neighborhood: any,
  identifier = `LOT-${Date.now()}-${++seq}`,
): Promise<UnitFixture> {
  const houseTypeId = await getCatalogPublicId(token, 'unit_types', 'house');
  const ownerRoleId = await getCatalogPublicId(
    token,
    'user_unit_roles',
    'owner',
  );
  return {
    streetId: neighborhood.streets[0].publicId,
    unitTypeId: houseTypeId,
    unitRoleId: ownerRoleId,
    unitIdentifier: identifier,
    isCurrentOccupant: true,
  };
}

/**
 * Creates a neighborhood atomically (streets + first admin). The admin starts
 * with status PENDING_ONBOARDING and the default dev password `1234`.
 */
export async function createNeighborhood(
  token: string,
  overrides: Record<string, any> = {},
): Promise<NeighborhoodFixture> {
  const cityId = await getChihuahuaCityId(token);
  const adminEmail = uniqueEmail('admin');
  const name = unique('neigh').toLocaleLowerCase();

  const payload = {
    name,
    adminEmail,
    streets: [{ name: 'calle principal' }],
    isActive: true,
    zipCode: '31000',
    cityId,
    ...overrides,
  };

  const res = await axios.post('/api/neighborhood', payload, {
    headers: { ...authHeaders(token), 'X-Idempotency-Key': newIdempotencyKey() },
  });
  expectEnvelope(res, 201);

  return {
    neighborhood: res.data.data,
    adminEmail: payload.adminEmail.trim().toLowerCase(),
    name: payload.name.trim().toLowerCase(),
  };
}

/**
 * Turns the first admin of a neighborhood into an ACTIVE admin by completing
 * the onboarding flow (unit + complete) with the default password.
 */
export async function activateAdmin(
  fixture: NeighborhoodFixture,
): Promise<Session> {
  const session = await login(fixture.adminEmail, DEFAULT_PWD);

  const unit = await buildUnitFixture(
    session.token,
    fixture.neighborhood,
    `LOT-${Date.now()}-${++seq}`,
  );

  const unitRes = await axios.post('/api/onboarding/unit', unit, {
    headers: authHeaders(session.token),
  });
  expectEnvelope(unitRes, 201);

  const completeRes = await axios.post(
    '/api/onboarding/complete',
    {},
    { headers: authHeaders(session.token) },
  );
  expectEnvelope(completeRes, 201);

  return session;
}

/** Creates a unit directly in the neighborhood as the scope-context user. */
export async function createUnit(
  token: string,
  neighborhood: any,
  overrides: Partial<UnitFixture> = {},
): Promise<any> {
  const unit = await buildUnitFixture(token, neighborhood);
  const payload = { ...unit, ...overrides };

  const res = await axios.post(
    `/api/neighborhood/${neighborhood.publicId}/units`,
    payload,
    { headers: authHeaders(token) },
  );
  expectEnvelope(res, 201);
  return res.data.data;
}

/** Creates a resident (role resident) with a fresh unit in the neighborhood. */
export async function createResident(
  token: string,
  neighborhood: any,
  overrides: Record<string, any> = {},
  raw = false,
): Promise<any> {
  const residentRoleId = await getCatalogPublicId(
    token,
    'user_roles',
    'resident',
  );
  const unit = await buildUnitFixture(token, neighborhood);

  const payload = {
    email: uniqueEmail('resident'),
    userRoleId: residentRoleId,
    unit,
    ...overrides,
  };

  const res = await axios.post(
    `/api/neighborhoods/${neighborhood.publicId}/residents`,
    payload,
    { headers: authHeaders(token) },
  );
  if (raw) {
    return res;
  }
  expectEnvelope(res, 201);
  return res.data.data;
}