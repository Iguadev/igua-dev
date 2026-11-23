import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Permanent_Marker } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { siteUrl } from '@/lib/env';
import './globals.css';
import { headers } from 'next/headers';
import { getI18n } from '@/lib/i18n/server';
import { languageTags } from '@/lib/i18n/routing';
import { LanguageProvider } from '@/components/i18n/provider';
import { localizeMetadata, pageLabels, siteEntities } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
const marker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-marker',
});
export async function generateMetadata(): Promise<Metadata> {
  const { language, t } = await getI18n();
  const h = await headers();
  const path = h.get('x-igua-path') || '/';
  const title = t('IGUA.DEV — El futuro también se construye desde acá.');
  const metadata = localizeMetadata(
    {
      metadataBase: new URL(siteUrl),
      title: { default: title, template: '%s | IGUA.DEV' },
      description:
        'Código, comunidad y oportunidades. Una comunidad abierta de developers, creadores y personas curiosas por la tecnología en Puerto Iguazú, Misiones.',
      alternates: { canonical: path },
      icons: { icon: '/brand/symbol.svg' },
    },
    language,
  );
  if (
    /^\/(dashboard|admin|login|auth|api)(?:\/|$)/.test(path) ||
    h.get('x-igua-filtered') === 'true'
  )
    metadata.robots = { index: false, follow: true };
  return metadata;
}
export const viewport: Viewport = { themeColor: '#0B1016', colorScheme: 'dark' };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { language, t } = await getI18n();
  const h = await headers();
  const path = h.get('x-igua-path') || '/';
  return (
    <html
      lang={languageTags[language]}
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable} ${marker.variable}`}
    >
      <body>
        <LanguageProvider language={language}>
          <a href="#main" className="skip-link">
            {t('Saltar al contenido')}
          </a>
          {!/^\/(dashboard|admin|login|auth|api)(?:\/|$)/.test(path) && (
            <JsonLd data={siteEntities(path, language, t(pageLabels[path] || 'IGUA.DEV'))} />
          )}
          <Header />
          <main id="main">{children}</main>
          <Footer />
          {process.env.VERCEL && <Analytics />}
        </LanguageProvider>
      </body>
    </html>
  );
}
