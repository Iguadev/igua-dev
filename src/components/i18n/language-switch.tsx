'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useI18n } from './provider';
import { languagePath, languages, languageTags, type Language } from '@/lib/i18n/routing';
const names: Record<Language, string> = { es: 'Español', pt: 'Português', en: 'English' };
const flags: Record<Language, string> = {
  es: '/flags/ar.svg',
  pt: '/flags/br.svg',
  en: '/flags/us.svg',
};
export function LanguageSwitch() {
  const { language, t } = useI18n();
  const pathname = usePathname();
  const search = useSearchParams();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const query = search.size ? `?${search}` : '';
  return (
    <div
      className="language-menu"
      ref={rootRef}
      data-open={open}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="language-switch"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t('Cambiar idioma')}: ${names[language]}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe size={17} strokeWidth={1.8} aria-hidden="true" />
        <span>{language.toUpperCase()}</span>
        <ChevronDown className="language-chevron" size={14} aria-hidden="true" />
      </button>
      <ul id={listId} className="language-list" inert={!open}>
        {languages.map((option) => (
          <li key={option}>
            <a
              href={languagePath(option, pathname) + query}
              hrefLang={languageTags[option]}
              lang={languageTags[option]}
              aria-current={option === language ? 'true' : undefined}
              onClick={(event) => {
                const hash = window.location.hash;
                if (hash) event.currentTarget.href += hash;
              }}
            >
              <img className="language-flag" src={flags[option]} alt="" width={20} height={20} />
              <span className="language-name">{names[option]}</span>              {option === language && <Check size={15} aria-hidden="true" />}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
