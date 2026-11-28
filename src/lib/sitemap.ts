import type { MetadataRoute } from 'next';
import { productionSiteUrl } from './env';
import { languagePath, languages } from './i18n/routing';
import { languageAlternates } from './seo';
export const publicSitemapPaths = [
  '/',
  '/about',
  '/events',
  '/programs',
  '/projects',
  '/community',
  '/members',
  '/reglamento',
  '/recursos',
  '/partners',
  '/join',
  '/privacy',
] as const;
const pagePriority: Record<string, number> = {
  '/': 1,
  '/about': 0.9,
  '/events': 0.9,
  '/join': 0.9,
  '/recursos': 0.8,
  '/programs': 0.8,
  '/projects': 0.8,
  '/community': 0.8,
  '/partners': 0.7,
  '/reglamento': 0.6,
  '/privacy': 0.5,
};
export function sitemapEntries(
  extra: { path: string; lastModified?: string | Date }[] = [],
): MetadataRoute.Sitemap {
  const pages = [
    ...publicSitemapPaths.map((path) => ({ path, lastModified: undefined as Date | undefined })),
    ...extra,
  ];
  return pages.flatMap(({ path, lastModified }) =>
    languages.map((language) => ({
      url: new URL(languagePath(language, path), productionSiteUrl).href,
      lastModified,
      changeFrequency:
        path === '/' || path === '/events' || path === '/recursos' ? 'weekly' : 'monthly',
      priority: pagePriority[path] ?? 0.6,
      alternates: { languages: languageAlternates(path, productionSiteUrl) },
    })),
  );
}
