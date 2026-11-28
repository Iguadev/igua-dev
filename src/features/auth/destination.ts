import { languagePath, stripLanguage, type Language } from '@/lib/i18n/routing';
import { safeNext } from '@/lib/utils';

export function memberDestination(language: Language, next: unknown, onboarded: boolean) {
  const parsed = new URL(safeNext(next), 'https://iguazu.dev');
  const path = stripLanguage(parsed.pathname);
  const destination =
    path.startsWith('//') || /^\/(login|join|auth|api|_next)(\/|$)/.test(path)
      ? languagePath(language, '/dashboard')
      : languagePath(language, path + parsed.search + parsed.hash);
  const profile = languagePath(language, '/dashboard/profile');
  if (onboarded) return destination;
  if (path === '/dashboard/profile' || destination === languagePath(language, '/dashboard'))
    return profile;
  return `${profile}?next=${encodeURIComponent(destination)}`;
}
