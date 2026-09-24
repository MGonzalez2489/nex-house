import { SUPERADMIN, expect, test } from './fixtures';

test.describe('Navigation & role guards', () => {
  test('super_admin sees the root layout menu (Dashboard + Fraccionamientos)', async ({
    page,
    loginAs,
  }) => {
    await loginAs(SUPERADMIN.email, SUPERADMIN.password);

    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /fraccionamientos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /residentes/i })).toBeHidden();
  });

  test('super_admin is redirected from the admin-only /residents route', async ({
    page,
    loginAs,
  }) => {
    await loginAs(SUPERADMIN.email, SUPERADMIN.password);

    await page.goto('/residents');
    await expect(page.getByRole('heading', { name: 'Acceso Restringido' })).toBeVisible();
  });

  test('admin sees the admin layout menu (Residentes + Unidades)', async ({
    page,
    loginAs,
    createAdmin,
  }) => {
    const admin = await createAdmin();
    await loginAs(admin.email, admin.password);

    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /residentes/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /unidades/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /fraccionamientos/i })).toBeHidden();
  });
});