'use client';
import { createContext, useContext } from 'react';
import { translator, type Language } from '@/lib/i18n/routing';
import english from '@/lib/i18n/en-ui.json';
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
  return { language, t: translator(language, english) };
}
