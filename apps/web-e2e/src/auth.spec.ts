import { SUPERADMIN, expect, test } from './fixtures';

test.describe('Auth & sessions', () => {
  test('login page renders and is prefilled with the demo credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(
      page.getByRole('heading', { name: 'Bienvenido de vuelta' }),
    ).toBeVisible();
    await expect(
      page.locator('app-auth-email-field input[type="email"]'),
    ).toHaveValue(SUPERADMIN.email);
    await expect(page.locator('#password input[type="password"]')).toHaveValue(
      SUPERADMIN.password,
    );
  });

  test('shows an error for invalid credentials and stays on the login page', async ({
    page,
  }) => {
    await page.goto('/auth/login');
    await page.locator('#password input[type="password"]').fill('wrong-password');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page.locator('p-message')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('logs in with the demo credentials and lands on the dashboard', async ({
    page,
    loginAs,
  }) => {
    await loginAs(SUPERADMIN.email, SUPERADMIN.password);
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});