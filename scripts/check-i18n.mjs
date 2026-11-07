import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const routes = [
  '',
  '/about',
  '/partners',
  '/events',
  '/projects',
  '/programs',
  '/community',
  '/reglamento',
  '/recursos',
  '/join',
  '/privacy',
  '/login',
];
for (const path of routes) {
  const url = new URL(`/en${path}`, base);
  const response = await fetch(url);
  assert.equal(response.status, 200, url.href);
  const html = await response.text();
  assert.match(html, /<html[^>]+lang="en"/);
  assert.ok(html.includes(`rel="canonical" href="${url.href}"`), `canonical ${path}`);
  assert.match(html, /hrefLang="es-AR"|hreflang="es-AR"/);
  assert.match(html, /hrefLang="en"|hreflang="en"/);
  assert.ok(html.includes('/social/en'), `English social image ${path}`);
  const visible = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ');
  await mkdir('../../work/i18n/rendered', { recursive: true });
  await writeFile(`../../work/i18n/rendered/${path.replaceAll('/', '') || 'home'}.txt`, visible);
}
const es = await (
  await fetch(new URL('/partners', base), { headers: { 'x-igua-language': 'en' } })
).text();
assert.match(es, /<html[^>]+lang="es-AR"/);
assert.ok(es.includes('El talento local necesita oportunidades reales.'));
for (const path of ['/en/admin', '/en/dashboard', '/en/dashboard/profile']) {
  const r = await fetch(new URL(path, base), { redirect: 'manual' });
  assert.equal(r.status, 307);
  assert.equal(new URL(r.headers.get('location'), base).pathname, '/en/login');
}
const sm = await (await fetch(new URL('/sitemap.xml', base))).text();
assert.ok(sm.includes(`${base}/en/partners`));
assert.ok(sm.includes('hreflang="en"'));
const llms = await (await fetch(new URL('/llms.txt', base))).text();
assert.ok(llms.includes(`${base}/en/about`));
const robots = await (await fetch(new URL('/robots.txt', base))).text();
assert.ok(robots.includes('Disallow: /en/admin'));
for (const language of ['es', 'en']) {
  const r = await fetch(new URL(`/social/${language}`, base));
  assert.equal(r.status, 200);
  assert.ok(r.headers.get('content-type')?.includes('image/png'));
}
console.log(
  'PASS: 12 English pages, language headers, canonicals, hreflang, protected redirects, bilingual sitemap, llms.txt, robots and both social images.',
);
