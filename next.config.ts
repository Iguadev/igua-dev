import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';
const config: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: '3mb' } },
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [
          {
            protocol: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).protocol.replace(':', '') as
              'http' | 'https',
            hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
            port: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).port,
            pathname: '/storage/v1/object/**',
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(config, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : config;
