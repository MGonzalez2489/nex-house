import { expect, requestRecoveryCode, test } from './fixtures';

const STRONG_PASSWORD = 'NexHouse!1234';

test.describe('Password recovery flow', () => {
  test('recovers a disposable admin password end-to-end', async ({
    page,
    createAdmin,
  }) => {
    const admin = await createAdmin();

    await requestRecoveryCode(page, admin.email);
    await expect(page.getByRole('heading', { name: 'Valida tu código' })).toBeVisible();

    // The code returned by the API is stored in the AuthStore and pre-fills the field.
    await page.getByRole('button', { name: 'Enviar' }).click();
    await page.waitForURL(/\/auth\/password-recovery$/);

    await page.locator('#password input').fill(STRONG_PASSWORD);
    await page.locator('#confirmPassword input').fill(STRONG_PASSWORD);
    await page.getByRole('button', { name: 'Restablecer Contraseña' }).click();

    // After the reset the app logs the user in automatically.
    await page.waitForURL(/\/dashboard$/);
    await expect(page.getByRole('link', { name: /residentes/i })).toBeVisible();
  });
});