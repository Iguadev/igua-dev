'use client';

import { useI18n } from '@/components/i18n/provider';
import Link from '@/components/localized-link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Wordmark } from './brand';
import { Button } from './ui/button';
import { LanguageSwitch } from './i18n/language-switch';
import { stripLanguage } from '@/lib/i18n/routing';
const links = [
  ['/about', 'Nosotros'],
  ['/events', 'Eventos'],
  ['/programs', 'Programas'],
  ['/projects', 'Proyectos'],
  ['/community', 'Comunidad'],
  ['/recursos', 'Recursos'],
];
const mobileLinks = [...links, ['/partners', 'Aliados']];
export function Header({ signedIn }: { signedIn: boolean }) {
  const { t } = useI18n();
  const pathname = stripLanguage(usePathname());
  const memberArea = /^\/(dashboard|admin)(\/|$)/.test(pathname);
  const [open, setOpen] = useState(false);
  const isHome = pathname === '/';
  const [intro] = useState(isHome);
  const [scrolled, setScrolled] = useState(false);
  const [tone, setTone] = useState<string>();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      const probe = headerRef.current?.offsetHeight ?? 0;
      const section = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-tone]')).find(
        (element) => {
          const rect = element.getBoundingClientRect();
          return rect.top <= probe && rect.bottom > probe;
        },
      );
      setTone(section?.dataset.navTone);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pathname]);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const outside = [document.querySelector('main'), document.querySelector('footer')];
    document.documentElement.classList.add('menu-open');
    outside.forEach((element) => element?.setAttribute('inert', ''));
    panelRef.current?.querySelector('nav')?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 1024) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.documentElement.classList.remove('menu-open');
      outside.forEach((element) => element?.removeAttribute('inert'));
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      toggleRef.current?.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <header
      ref={headerRef}
      data-tone={open ? undefined : tone}
      className={cn(
        'site-header',
        isHome && 'is-overlay',
        scrolled && 'is-scrolled',
        intro && 'is-intro',
        open && 'is-menu-open',
      )}
    >
      <div className="container header-inner">
        <Link href="/" className="brand-link" aria-label={t('IGUA.DEV, inicio')}>
          <Wordmark />
        </Link>
        <nav aria-label={t('Navegación principal')} className="desktop-nav">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? 'page' : undefined}
            >
              {t(label)}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <LanguageSwitch />
          {!signedIn && (
            <Button asChild size="sm" className="header-join">
              <Link href="/join">
                {t('Sumate')}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </Button>
          )}
          {signedIn && !memberArea && (
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">{t('Mi espacio')}</Link>
            </Button>
          )}
        </div>
        <button
          ref={toggleRef}
          type="button"
          className="mobile-menu menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t('Cerrar menú') : t('Abrir menú')}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="menu-toggle-lines" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>
      <div
        id="mobile-menu"
        ref={panelRef}
        className="mobile-menu-panel"
        data-open={open}
        inert={!open}
      >
        <nav aria-label={t('Navegación móvil')} className="container" tabIndex={-1}>
          <ul>
            {mobileLinks.map(([href, label], index) => (
              <li key={href} style={{ '--i': index } as React.CSSProperties}>
                <Link
                  href={href}
                  aria-current={pathname.startsWith(href) ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {t(label)}
                  <ArrowUpRight size={22} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div
            className="mobile-menu-actions"
            style={{ '--i': mobileLinks.length } as React.CSSProperties}
          >
            <Button asChild variant={signedIn ? 'outline' : 'default'}>
              <Link href={signedIn ? '/dashboard' : '/join'} onClick={() => setOpen(false)}>
                {signedIn ? t('Mi espacio') : t('Unirme a IGUA.DEV')}
                {!signedIn && <ArrowUpRight size={18} aria-hidden="true" />}
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
