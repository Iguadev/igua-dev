import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from '@babel/parser';
import english from '../src/lib/i18n/en.json';
import ui from '../src/lib/i18n/en-ui.json';
import portuguese from '../src/lib/i18n/pt.json';
import portugueseUi from '../src/lib/i18n/pt-ui.json';
import { languagePath, stripLanguage, translator } from '../src/lib/i18n/routing';
import {
  localizeMetadata,
  languageAlternates,
  siteEntities,
  faqEntities,
  eventEntities,
  projectEntities,
} from '../src/lib/seo';
import { findResources, resources, resourceCategories } from '../src/features/resources/catalog';
import { productionSiteUrl } from '../src/lib/env';
import { sitemapEntries, publicSitemapPaths } from '../src/lib/sitemap';

describe('language routing and discoverability', () => {
  it('uses the www production origin without a trailing slash', () => {
    expect(productionSiteUrl).toBe('https://www.iguazu.dev');
  });
  it('lists public pages on the production origin for crawlers', () => {
    const entries = sitemapEntries();
    expect(publicSitemapPaths).toContain('/recursos');
    expect(entries.some((entry) => entry.url === 'https://www.iguazu.dev/')).toBe(true);
    expect(entries.some((entry) => entry.url === 'https://www.iguazu.dev/en/about')).toBe(true);
    expect(entries.some((entry) => entry.url === 'https://www.iguazu.dev/pt/join')).toBe(true);
    expect(entries.every((entry) => entry.url.startsWith('https://www.iguazu.dev'))).toBe(true);
    expect(entries.find((entry) => entry.url === 'https://www.iguazu.dev/en/about')?.alternates?.languages?.en).toBe(
      'https://www.iguazu.dev/en/about',
    );
  });
  it('keeps equivalent pages, queries and fragments in both languages', () => {
    expect(languagePath('en', '/partners#colaborar')).toBe('/en/partners#colaborar');
    expect(languagePath('es', '/en/recursos?q=Git&tema=git')).toBe('/recursos?q=Git&tema=git');
    expect(languagePath('en', '/en/about')).toBe('/en/about');
    expect(stripLanguage('/enough')).toBe('/enough');
    expect(languagePath('en', '/')).toBe('/en');
    expect(languagePath('pt', '/en/about?x=1')).toBe('/pt/about?x=1');
    expect(languagePath('pt', '/')).toBe('/pt');
    expect(languagePath('es', '/pt/events')).toBe('/events');
    expect(stripLanguage('/pt')).toBe('/');
    expect(stripLanguage('/ptolomeo')).toBe('/ptolomeo');
  });
  it('keeps every dictionary in sync with the English source keys', () => {
    expect(Object.keys(portuguese)).toEqual(Object.keys(english));
    expect(Object.keys(portugueseUi)).toEqual(Object.keys(ui));
    for (const value of Object.values(portuguese)) expect(value.trim()).not.toBe('');
  });
  it('does not localize external, asset or API destinations', () => {
    for (const path of [
      'https://cursor.com/docs',
      '/api/jobs/email',
      '/auth/callback',
      '/brand/symbol.svg',
      '#convivencia',
    ])
      expect(languagePath('en', path)).toBe(path);
  });
  it('uses a self-canonical and reciprocal language links', () => {
    const m = localizeMetadata(
      {
        title: 'Nuestra historia',
        description: 'Una comunidad abierta',
        alternates: { canonical: '/about' },
      },
      'en',
    );
    expect(m.title).toBe('Our story');
    expect(m.alternates?.canonical).toBe('/en/about');
    expect(languageAlternates('/about').en).toBe('https://www.iguazu.dev/en/about');
    expect(languageAlternates('/about')['es-AR']).toBe('https://www.iguazu.dev/about');
    expect(languageAlternates('/about')['pt-BR']).toBe('https://www.iguazu.dev/pt/about');
    expect(m.openGraph?.locale).toBe('en_US');
    const pt = localizeMetadata({ title: 'Nuestra historia', alternates: { canonical: '/about' } }, 'pt');
    expect(pt.alternates?.canonical).toBe('/pt/about');
    expect(pt.openGraph?.locale).toBe('pt_BR');
    expect(pt.title).not.toBe('Nuestra historia');
  });
  it('describes the organization consistently without invented contact details or metrics', () => {
    const schema = siteEntities('/partners', 'en', 'Partners');
    const org = schema['@graph'][0];
    expect(org).toMatchObject({
      name: 'IGUA.DEV',
      location: {
        address: {
          addressLocality: 'Puerto Iguazú',
          addressRegion: 'Misiones',
          addressCountry: 'AR',
        },
      },
    });
    expect(org).not.toHaveProperty('telephone');
    expect(org).not.toHaveProperty('email');
    expect(org).not.toHaveProperty('numberOfEmployees');
    expect(org).not.toHaveProperty('sameAs');
    expect(schema['@graph'][0]).toMatchObject({
      knowsAbout: expect.arrayContaining(['software engineering']),
    });
    expect(schema['@graph'][1]).toMatchObject({
      potentialAction: {
        target: {
          urlTemplate: expect.stringMatching(/\/en\/recursos\?q=\{search_term_string\}$/),
        },
      },
    });
    const faq = faqEntities('es', [
      { question: '¿Qué es IGUA.DEV?', answer: 'Una comunidad independiente de tecnología.' },
    ]);
    expect(faq['@id']).toMatch(/\/about#faq$/);
    expect(faq['@id']).not.toMatch(/#webpage$/);
    expect(
      eventEntities('es', {
        slug: 'meetup',
        title: 'Meetup',
        description: 'Encuentro comunitario.',
        starts_at: '2026-12-01T19:00:00-03:00',
        ends_at: '2026-12-01T21:00:00-03:00',
        status: 'completed',
        venues: null,
      }).eventStatus,
    ).toBe('https://schema.org/EventCompleted');
    expect(
      eventEntities('en', {
        slug: 'meetup',
        title: 'Meetup',
        description: 'Community meetup.',
        starts_at: '2026-12-01T19:00:00-03:00',
        ends_at: '2026-12-01T21:00:00-03:00',
        status: 'published',
        venues: { name: 'Casa de la Cultura', address: 'Puerto Iguazú' },
      }).eventAttendanceMode,
    ).toBe('https://schema.org/OfflineEventAttendanceMode');
    const project = projectEntities('pt', {
      slug: 'demo',
      title: 'Demo',
      description: 'Um projeto da comunidade.',
      github_url: 'https://github.com/example/demo',
      demo_url: null,
    });
    expect(project['@type']).toBe('CreativeWork');
    expect(project.sameAs).toEqual(['https://github.com/example/demo']);
  });
  it('searches the visible English resource descriptions', () => {
    const t = translator('en', english);
    expect(findResources('exposed secrets', 'all', t).map((r) => r.id)).toEqual([
      'github-sensitive-data',
    ]);
    for (const resource of resources) {
      expect(english).toHaveProperty(resource.title);
      expect(english).toHaveProperty(resource.description);
    }
    for (const category of resourceCategories) expect(english).toHaveProperty(category.label);
  });
  it('covers every explicit translation call and all client message keys', () => {
    const missing: string[] = [];
    const walkFiles = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory()
          ? walkFiles(join(dir, e.name))
          : e.name.endsWith('.tsx')
            ? [join(dir, e.name)]
            : [],
      );
    for (const file of [...walkFiles('src/app'), ...walkFiles('src/components')]) {
      const source = readFileSync(file, 'utf8');
      const client = source.startsWith("'use client'");
      const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
      const walk = (node: unknown) => {
        if (!node || typeof node !== 'object') return;
        const n = node as Record<string, unknown>;
        if (n.type === 'CallExpression' && (n.callee as { name?: string })?.name === 't') {
          const arg = (n.arguments as { type?: string; value?: string }[])[0];
          if (arg?.type === 'StringLiteral' && arg.value) {
            if (!(arg.value in english)) missing.push(`${file}: ${arg.value}`);
            if (client && !(arg.value in ui))
              missing.push(`${file}: missing client key ${arg.value}`);
          }
        }
        for (const [key, value] of Object.entries(n)) {
          if (key === 'loc') continue;
          if (Array.isArray(value)) value.forEach(walk);
          else if (value && typeof value === 'object') walk(value);
        }
      };
      walk(ast);
    }
    expect(missing).toEqual([]);
  });
});
