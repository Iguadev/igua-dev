import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/env';
import { events, projects } from '@/lib/data';
import { languagePath } from '@/lib/i18n/routing';
import { languageAlternates } from '@/lib/seo';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [e, p] = await Promise.all([events(), projects()]);
  const paths = [
    '',
    '/about',
    '/events',
    '/programs',
    '/projects',
    '/community',
    '/reglamento',
    '/recursos',
    '/partners',
    '/join',
    '/privacy',
    ...e.map((x) => `/events/${x.slug}`),
    ...p.map((x) => `/projects/${x.slug}`),
  ];
  return paths.flatMap((path) =>
    (['es', 'en'] as const).map((language) => ({
      url: new URL(languagePath(language, path || '/'), siteUrl).href,
      alternates: { languages: languageAlternates(path || '/') },
    })),
  );
}
