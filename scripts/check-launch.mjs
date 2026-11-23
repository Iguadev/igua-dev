import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
for (const route of [
  '/',
  '/about',
  '/events',
  '/events?view=past',
  '/programs',
  '/projects',
  '/community',
  '/recursos',
  '/partners',
  '/join',
  '/login',
  '/privacy',
  '/robots.txt',
  '/sitemap.xml',
  '/opengraph-image',
  '/brand/symbol.svg',
  '/brand/symbol-reverse.svg',
  '/brand/wordmark.svg',
  '/brand/wordmark-reverse.svg',
]) {
  const response = await fetch(new URL(route, base));
  assert.equal(response.status, 200, route);
  if (response.headers.get('content-type')?.includes('text/html')) {
    const text = await response.text();
    assert.match(text, /<h1[ >]/, route);
    assert.doesNotMatch(text, /No pudimos cargar este espacio\./, route);
  }
}
for (const route of [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/events',
  '/dashboard/projects',
  '/dashboard/settings',
  '/admin',
  '/admin/events',
  '/admin/events/new',
  '/admin/members',
  '/admin/projects',
  '/admin/partners',
  '/admin/content',
  '/admin/settings',
]) {
  const response = await fetch(new URL(route, base), { redirect: 'manual' });
  assert.equal(response.status, 307, route);
  assert.equal(response.headers.get('location'), '/login', route);
}
for (const route of ['/events/no-such-event', '/projects/no-such-project', '/not-a-page']) {
  const response = await fetch(new URL(route, base));
  assert.ok([200, 404].includes(response.status), route);
  const text = await response.text();
  assert.match(text, /Por acá todavía no construimos/, route);
  assert.match(text, /noindex/, route);
}
for (const route of [
  '/api/jobs/email',
  '/api/admin/events/11111111-1111-4111-8111-111111111111/export',
])
  assert.equal((await fetch(new URL(route, base))).status, 401, route);
console.log(
  'PASS: 17 public responses, 13 protected redirects, 3 noindex missing-page views, 2 unauthorized APIs.',
);
