import { SUPERADMIN, expect, test } from './fixtures';

test.describe('Neighborhoods (super_admin only)', () => {
  test('lists neighborhoods from the API', async ({ page, loginAs }) => {
    await loginAs(SUPERADMIN.email, SUPERADMIN.password);

    await page.goto('/neighborhoods');
    await expect(page.getByRole('heading', { name: 'Fraccionamientos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nuevo' })).toBeVisible();
  });

  test('opens the new-neighborhood form', async ({ page, loginAs }) => {
    await loginAs(SUPERADMIN.email, SUPERADMIN.password);

    await page.goto('/neighborhoods');
    await page.getByRole('button', { name: 'Nuevo' }).click();

    await expect(page).toHaveURL(/\/neighborhoods\/new$/);
    await expect(page.getByRole('heading', { name: 'Nuevo fraccionamiento' })).toBeVisible();
  });
});