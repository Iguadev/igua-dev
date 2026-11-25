import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/env';
import { languages } from '@/lib/i18n/routing';
const privatePaths = ['/dashboard', '/admin', '/api', '/auth', '/login'];
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: languages.flatMap((language) =>
        privatePaths.map((path) => (language === 'es' ? path : `/${language}${path}`)),
      ),
    },
    sitemap: new URL('/sitemap.xml', siteUrl).href,
  };
}
