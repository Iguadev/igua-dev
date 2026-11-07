'use client';
import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { useI18n } from './i18n/provider';
import { languagePath } from '@/lib/i18n/routing';
export default function LocalizedLink({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { language } = useI18n();
  const target =
    typeof href === 'string'
      ? languagePath(language, href)
      : {
          ...href,
          pathname: href.pathname ? languagePath(language, href.pathname) : href.pathname,
        };
  return <NextLink href={target} {...props} />;
}
