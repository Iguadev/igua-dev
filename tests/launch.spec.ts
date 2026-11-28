import { test, expect } from '@playwright/test';

for (const [path, language] of [
  ['/', 'es-AR'],
  ['/pt', 'pt-BR'],
  ['/en', 'en'],
]) {
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

test('localized home pages fit a 320-pixel viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/', '/pt', '/en']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth), {
        message: path,
      })
      .toBe(0);
  }
});

test('landscape navigation fits and returns keyboard focus on close', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(nav.getByRole('link', { name: 'Resources' })).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
});

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
  const authPanel = page.locator('.auth-panel');
  const continueButton = authPanel.getByRole('button', {
    name: 'Continuar con Pollar',
    exact: true,
  });
  const closedNotice = authPanel.getByText(/El registro y el acceso todavía no están habilitados/);
  await expect(continueButton.or(closedNotice)).toBeVisible();
  await expect(
    authPanel.getByRole('button').filter({ hasNotText: /^Continuar con Pollar$/ }),
  ).toHaveCount(0);
  await expect(authPanel.locator('form')).toHaveCount(0);
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
test('filters and searches Stellar resources in English', async ({ page }) => {
  await page.goto('/en/recursos');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: 'Blockchain 2', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/recursos\?tema=blockchain$/);

  const cards = page.locator('[data-resource-id]');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toHaveAttribute('href', 'https://developers.stellar.org/');
  await expect(cards.nth(1)).toHaveAttribute('href', 'https://developers.stellar.org/docs');

  await page.getByRole('searchbox', { name: 'Search resources' }).fill('smart contracts');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(cards).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Stellar Developer Docs' })).toBeVisible();
  await page.getByRole('link', { name: 'Clear search and filters' }).click();
  await expect(page).toHaveURL(/\/en\/recursos$/);
  await expect(page.getByRole('link', { name: /^All \d+$/ })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
test('mobile navigation expands and closes when following a link', async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await page.goto('/');
  const openMenu = page.getByRole('button', { name: 'Abrir menú' });
  const navigation = page.getByRole('navigation', { name: 'Navegación móvil' });
  await expect(openMenu).toHaveAttribute('aria-expanded', 'false');
  await openMenu.click();
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(navigation).toBeVisible();
  await navigation.getByRole('link', { name: 'Programas', exact: true }).click();
  await expect(openMenu).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Muchos caminos.');
});
