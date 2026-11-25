export const languages = ['es', 'pt', 'en'] as const;
export type Language = (typeof languages)[number];
export const prefixedLanguages = ['pt', 'en'] as const satisfies readonly Language[];
export const languageTags: Record<Language, string> = { es: 'es-AR', pt: 'pt-BR', en: 'en' };
export const ogLocales: Record<Language, string> = { es: 'es_AR', pt: 'pt_BR', en: 'en_US' };
export function isLanguage(value: unknown): value is Language {
  return languages.includes(value as Language);
}
export function pathLanguage(path: string): Language {
  return prefixedLanguages.find((l) => path === `/${l}` || path.startsWith(`/${l}/`)) ?? 'es';
}
export function stripLanguage(path: string) {
  const language = pathLanguage(path);
  if (language === 'es') return path;
  return path === `/${language}` ? '/' : path.slice(language.length + 1);
}
export function languagePath(language: Language, path: string) {
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    /^\/(api|auth|_next|brand|social)(\/|$)/.test(path)
  )
    return path;
  const clean = stripLanguage(path);
  return language === 'es' ? clean : `/${language}${clean === '/' ? '' : clean}`;
}
export function translator(language: Language, dictionary: Record<string, string>) {
  return (source: string) => (language === 'es' ? source : (dictionary[source] ?? source));
}
export function pick<T>(language: Language, values: Record<Language, T>) {
  return values[language];
}
