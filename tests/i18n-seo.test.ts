import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from '@babel/parser';
import english from '../src/lib/i18n/en.json';
import ui from '../src/lib/i18n/en-ui.json';
import portuguese from '../src/lib/i18n/pt.json';
import portugueseUi from '../src/lib/i18n/pt-ui.json';
import { languagePath, stripLanguage, translator } from '../src/lib/i18n/routing';
import { localizeMetadata, languageAlternates, siteEntities } from '../src/lib/seo';
import { findResources, resources, resourceCategories } from '../src/features/resources/catalog';

describe('language routing and discoverability', () => {
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
    expect(m.alternates?.languages).toEqual(languageAlternates('/about'));
    expect(String(languageAlternates('/about').en)).toMatch(/\/en\/about$/);
    expect(String(languageAlternates('/about')['es-AR'])).toMatch(/\/about$/);
    expect(String(languageAlternates('/about')['pt-BR'])).toMatch(/\/pt\/about$/);
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
    expect(org).not.toHaveProperty('numberOfEmployees');
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
