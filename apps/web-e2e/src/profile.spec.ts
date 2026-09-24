import { SUPERADMIN, expect, test } from './fixtures';

test.describe('Profile', () => {
  test('renders the profile page for a logged-in user', async ({ page, loginAs }) => {
    await loginAs(SUPERADMIN.email, SUPERADMIN.password);

    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Mi perfil' })).toBeVisible();
  });
});