import type { MetadataRoute } from 'next';
import { productionSiteUrl } from '@/lib/env';
import { languages } from '@/lib/i18n/routing';
const privatePaths = ['/dashboard', '/admin', '/api', '/auth', '/login'];
export default function robots(): MetadataRoute.Robots {
  const preview = process.env.VERCEL_ENV === 'preview';
  const privateRoutes = languages.flatMap((language) =>
    privatePaths.map((path) => (language === 'es' ? path : `/${language}${path}`)),
  );
  return {
    rules: preview
      ? { userAgent: '*', disallow: '/' }
      : [
          {
            userAgent: '*',
            allow: ['/', '/llms.txt', '/sitemap.xml'],
            disallow: privateRoutes,
          },
          {
            userAgent: 'Googlebot',
            allow: ['/', '/llms.txt', '/sitemap.xml'],
            disallow: privateRoutes,
          },
        ],
    sitemap: `${productionSiteUrl}/sitemap.xml`,
    host: 'www.iguazu.dev',
  };
}
