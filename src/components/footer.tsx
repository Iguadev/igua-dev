import { getI18n } from '@/lib/i18n/server';
import Link from '@/components/localized-link';
import { Wordmark, Symbol } from './brand';
export async function Footer() {
  const { t, language } = await getI18n();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Link href="/" aria-label={t('IGUA.DEV, inicio')}>
              <Wordmark />
            </Link>
            <p>
              {t('Código, comunidad y oportunidades.')}
              <br />
              {t('Desde Puerto Iguazú, Misiones, Argentina.')}
            </p>
          </div>
          <nav aria-label={t('Enlaces del pie')}>
            <Link href="/about">{t('Nuestra historia')}</Link>
            <Link href="/recursos">{t('Recursos para aprender')}</Link>
            <Link href="/reglamento">{t('Reglamento')}</Link>
            <Link href="/partners">{t('Colaborá con la comunidad')}</Link>
            <Link href="/privacy">{t('Privacidad')}</Link>
          </nav>
          <Symbol className="footer-symbol" />
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} IGUA.DEV</span>
          <span>Built in Iguazú. Connected to the world.</span>
          <span className="status">
            <i />
            {' ' + t('Comunidad en construcción')}
          </span>
        </div>
      </div>
    </footer>
  );
}
