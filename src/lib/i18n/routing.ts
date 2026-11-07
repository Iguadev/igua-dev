export type Language = 'es' | 'en';
export function stripLanguage(path: string) {
  return path === '/en' ? '/' : path.startsWith('/en/') ? path.slice(3) : path;
}
export function languagePath(language: Language, path: string) {
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    /^\/(api|auth|_next|brand|social)(\/|$)/.test(path)
  )
    return path;
  const clean = stripLanguage(path);
  return language === 'en' ? `/en${clean === '/' ? '' : clean}` : clean;
}
export function translator(language: Language, dictionary: Record<string, string>) {
  return (source: string) => (language === 'en' ? (dictionary[source] ?? source) : source);
}
