import { test, expect } from '@playwright/test';

for (const [path, language] of [['/', 'es-AR'], ['/pt', 'pt-BR'], ['/en', 'en']]) {
  test(`serves the three-city map in ${language}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('#triple-frontera .frontier-city')).toHaveText([
      'Ciudad del Este',
      'Foz do Iguaçu',
      'Puerto Iguazú',
    ]);
  });
}

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
test('mobile navigation expands and closes when following a link', async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await page.goto('/');
  const openMenu = page.getByRole('button', { name: 'Abrir menú' });
  const navigation = page.getByRole('navigation', { name: 'Navegación móvil' });
  await expect(openMenu).toHaveAttribute('aria-expanded', 'false');
  await openMenu.click();
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  await navigation.getByRole('link', { name: 'Programas', exact: true }).click();
  await expect(openMenu).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Muchos caminos.');
});
