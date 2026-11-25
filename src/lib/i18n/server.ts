import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { isLanguage, translator, type Language } from './routing';
const dictionaries = {
  en: () => import('./en.json'),
  pt: () => import('./pt.json'),
};
export const getI18n = cache(async () => {
  const requestHeaders = await headers();
  const header = requestHeaders.get('x-igua-language');
  const language: Language = isLanguage(header) ? header : 'es';
  const dictionary: Record<string, string> =
    language === 'es' ? {} : (await dictionaries[language]()).default;
  return { language, t: translator(language, dictionary) };
});
