import { test, expect } from '@playwright/test';
test('launch journey is honest and public routes are accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'El futuro también se construye desde acá.',
  );
  await page.getByRole('link', { name: 'Explorar eventos', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'El próximo encuentro empieza con vos.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Quiero ser parte', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Continuar con GitHub' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Enviarme un enlace' })).toBeDisabled();
});
test('protects member and administrative routes without credentials', async ({ page, request }) => {
  for (const route of [
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/events',
    '/dashboard/projects',
    '/dashboard/settings',
    '/admin',
    '/admin/events',
    '/admin/members',
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login$/);
  }
  const r = await request.get('/api/admin/events/11111111-1111-4111-8111-111111111111/export');
  expect(r.status()).toBe(401);
  const cron = await request.get('/api/jobs/email');
  expect(cron.status()).toBe(401);
});
test('mobile navigation opens and closes with an accessible dialog', async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('link', { name: 'Programas', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Muchos caminos.');
});
