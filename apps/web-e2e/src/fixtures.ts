import { test as base, expect, Page } from '@playwright/test';
import { createDisposableAdmin, superAdminLogin } from './support/api';

export { expect };

export const SUPERADMIN = { email: 'root@test.com', password: '1234' };

export type DisposableAdmin = Awaited<ReturnType<typeof createDisposableAdmin>>;

type WebFixtures = {
  loginAs: (email: string, password: string) => Promise<void>;
  createAdmin: () => Promise<DisposableAdmin>;
  apiToken: () => Promise<string>;
};

export const test = base.extend<WebFixtures>({
  loginAs: async ({ page }, use) => {
    await use(async (email, password) => {
      await page.goto('/auth/login');
      await page.locator('app-auth-email-field input[type="email"]').fill(email);
      await page.locator('#password input[type="password"]').fill(password);
      await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
      await page.waitForURL(/\/dashboard$/);
    });
  },
  createAdmin: async (
    // eslint-disable-next-line no-empty-pattern -- playwright requires `{}` here
    {},
    use,
  ) => {
    await use(() => createDisposableAdmin());
  },
  apiToken: async (
    // eslint-disable-next-line no-empty-pattern -- playwright requires `{}` here
    {},
    use,
  ) => {
    await use(() => superAdminLogin());
  },
});

/** Fills and submits the password-recovery email step, returning when the
 *  code-validation page is reached. */
export async function requestRecoveryCode(page: Page, email: string): Promise<void> {
  await page.goto('/auth/recovery-request');
  await page.locator('app-auth-email-field input[type="email"]').fill(email);
  await page.getByRole('button', { name: 'Enviar' }).click();
  await page.waitForURL(/\/auth\/validate-code$/);
}