import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { translator, type Language } from './routing';
export const getI18n = cache(async () => {
  const requestHeaders = await headers();
  const language: Language = requestHeaders.get('x-igua-language') === 'en' ? 'en' : 'es';
  const dictionary = language === 'en' ? (await import('./en.json')).default : {};
  return { language, t: translator(language, dictionary) };
});
