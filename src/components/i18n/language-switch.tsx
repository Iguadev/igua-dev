'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useI18n } from './provider';
import { languagePath } from '@/lib/i18n/routing';
export function LanguageSwitch() {
  const { language } = useI18n();
  const pathname = usePathname();
  const search = useSearchParams();
  const other = language === 'en' ? 'es' : 'en';
  const href = languagePath(other, pathname) + (search.size ? `?${search}` : '');
  return (
    <a
      className="language-switch"
      href={href}
      hrefLang={other === 'es' ? 'es-AR' : 'en'}
      lang={other === 'es' ? 'es' : 'en'}
      aria-label={other === 'es' ? 'Cambiar a español' : 'Switch to English'}
      onClick={(event) => {
        const hash = window.location.hash;
        if (hash) event.currentTarget.href = href + hash;
      }}
    >
      {other === 'es' ? 'ES' : 'EN'}
    </a>
  );
}
