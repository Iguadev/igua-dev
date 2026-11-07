'use client';

import { useI18n } from '@/components/i18n/provider';
import Link from '@/components/localized-link';
import { usePathname } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
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
export function Header() {
  const { t, language } = useI18n();
  const pathname = stripLanguage(usePathname());
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
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
          <Link className="login-link" href="/login">
            {t('Ingresar')}
          </Link>
          <Button asChild size="sm">
            <Link href="/join">
              {t('Sumate') + ' '}
              <ArrowUpRight size={15} />
            </Link>
          </Button>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="mobile-menu icon-button" aria-label={t('Abrir menú')}>
              <Menu />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="menu-overlay" />
            <Dialog.Content className="mobile-panel">
              <Dialog.Title className="sr-only">{t('Navegación')}</Dialog.Title>
              <Dialog.Description className="sr-only">
                {t('Explorá la comunidad IGUA.DEV.')}
              </Dialog.Description>
              <div className="mobile-panel-top">
                <Wordmark />
                <Dialog.Close asChild>
                  <button className="icon-button" aria-label={t('Cerrar menú')}>
                    <X />
                  </button>
                </Dialog.Close>
              </div>
              <nav aria-label={t('Navegación móvil')}>
                {[
                  ...links,
                  ['/partners', t('Aliados')],
                  ['/login', t('Ingresar')],
                  ['/join', t('Unirme a IGUA.DEV')],
                ].map(([href, label]) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)}>
                    {t(label)}
                    <ArrowUpRight size={20} />
                  </Link>
                ))}
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
