'use client';
import { createContext, useContext } from 'react';
import { translator, type Language } from '@/lib/i18n/routing';
import english from '@/lib/i18n/en-ui.json';
import portuguese from '@/lib/i18n/pt-ui.json';
const dictionaries: Record<Language, Record<string, string>> = {
  es: {},
  pt: portuguese,
  en: english,
};
const LocaleContext = createContext<Language>('es');
export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={language}>{children}</LocaleContext.Provider>;
}
export function useI18n() {
  const language = useContext(LocaleContext);
  return { language, t: translator(language, dictionaries[language]) };
}
