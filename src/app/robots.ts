import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/env';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/admin',
        '/api',
        '/auth',
        '/login',
        '/en/dashboard',
        '/en/admin',
        '/en/api',
        '/en/auth',
        '/en/login',
      ],
    },
    sitemap: new URL('/sitemap.xml', siteUrl).href,
  };
}
