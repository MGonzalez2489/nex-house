/**
 * Direct API helpers for web e2e setup. Tests may seed disposable data through
 * the e2e API (PORT 3001) instead of driving the UI, keeping the browser specs
 * focused on what the UI actually renders.
 */

const API_URL = `http://localhost:${process.env['API_E2E_PORT'] || '3001'}`;
const DEFAULT_PWD = '1234';

const log = (...args: unknown[]): void => {
  console.log('[web-e2e]', ...args);
};

async function api<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const body = await res.text();
  const json = (() => {
    try {
      return JSON.parse(body) as { data: T; message?: string };
    } catch {
      throw new Error(
        `API ${init.method ?? 'GET'} ${path} -> status ${res.status}, ` +
          `content-type ${res.headers.get('content-type')}, body: ${body.slice(0, 200)}`,
      );
    }
  })();
  if (!res.ok) {
    throw new Error(`API ${init.method ?? 'GET'} ${path} -> ${res.status}: ${json?.message}`);
  }
  return json.data;
}

const post = <T>(
  path: string,
  body: Record<string, unknown>,
  token?: string,
  idempotencyKey?: string,
): Promise<T> =>
  api<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
    },
  });

export const newIdempotencyKey = (): string => crypto.randomUUID();

export const superAdminLogin = async (): Promise<string> => {
  const session = await post<{ token: string }>('/api/auth/login', {
    email: 'root@test.com',
    password: DEFAULT_PWD,
  });
  return session.token;
};

const getCatalogId = async <T extends { publicId: string }>(
  path: string,
  predicate: (entry: T) => boolean,
  token: string,
): Promise<string> => {
  const entries = await api<T[]>(path, {}, token);
  const found = entries.find(predicate);
  if (!found) {
    throw new Error(`Catalog entry not found in ${path}`);
  }
  return found.publicId;
};

interface DisposableAdmin {
  email: string;
  password: string;
  neighborhoodId: string;
  neighborhoodName: string;
}

interface NeighborhoodCreate {
  publicId: string;
  streets: { publicId: string }[];
}

/**
 * Creates a neighborhood + its first admin through the API and activates the
 * admin (unit + complete). This mirrors the fixture used by the api-e2e suite.
 * The new admin keeps the default dev password `1234`.
 */
export async function createDisposableAdmin(prefix = 'web-e2e'): Promise<DisposableAdmin> {
  const token = await superAdminLogin();
  const email = `${prefix}-${Date.now()}@nexhouse.test`;

  const cityId = await getCatalogId('/api/catalogs/countries', (c) => c.code === 'MX', token).then(
    async (mxId) =>
      getCatalogId(
        `/api/catalogs/states/${mxId}`,
        (s) => s.code === 'CHH',
        token,
      ).then((chhId) => getCatalogId(`/api/catalogs/cities/${chhId}`, () => true, token)),
  );

  const neighborhoodName = `${prefix}-neighborhood-${Date.now()}`;
  const neighborhood = await post<NeighborhoodCreate>(
    '/api/neighborhood',
    {
      name: neighborhoodName,
      adminEmail: email,
      streets: [{ name: 'Calle Principal' }],
      isActive: true,
      zipCode: '31100',
      cityId,
    },
    token,
    newIdempotencyKey(),
  );

  const adminToken = await (async () => {
    const session = await post<{ token: string }>('/api/auth/login', {
      email,
      password: DEFAULT_PWD,
    });
    return session.token;
  })();

  const unitTypeId = await getCatalogId('/api/catalogs/unit_types', (t) => t.name === 'house', adminToken);
  const unitRoleId = await getCatalogId('/api/catalogs/user_unit_roles', (r) => r.name === 'owner', adminToken);

  await post(
    '/api/onboarding/unit',
    {
      streetId: neighborhood.streets[0].publicId,
      unitTypeId,
      unitRoleId,
      unitIdentifier: `LOT-${Date.now()}`,
      isCurrentOccupant: true,
    },
    adminToken,
  );
  await post('/api/onboarding/complete', {}, adminToken);

  log(`created disposable admin ${email} (neighborhood ${neighborhoodName})`);
  return {
    email,
    password: DEFAULT_PWD,
    neighborhoodId: neighborhood.publicId,
    neighborhoodName,
  };
}

export { DEFAULT_PWD };