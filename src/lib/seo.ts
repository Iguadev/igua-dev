import type { Metadata } from 'next';
import english from './i18n/en.json';
import { languagePath, translator, type Language } from './i18n/routing';
import { siteUrl } from './env';
export function languageAlternates(path: string) {
  return {
    'es-AR': new URL(languagePath('es', path), siteUrl).href,
    en: new URL(languagePath('en', path), siteUrl).href,
    'x-default': new URL(languagePath('es', path), siteUrl).href,
  };
}
export function localizeMetadata(metadata: Metadata, language: Language): Metadata {
  const t = translator(language, english);
  const title = typeof metadata.title === 'string' ? t(metadata.title) : metadata.title;
  const description = metadata.description ? t(metadata.description) : undefined;
  const socialTitle =
    typeof title === 'string'
      ? title
      : title && 'default' in title
        ? title.default
        : t('IGUA.DEV — El futuro también se construye desde acá.');
  const path =
    typeof metadata.alternates?.canonical === 'string' ? metadata.alternates.canonical : undefined;
  return {
    ...metadata,
    title,
    description,
    ...(path
      ? {
          alternates: {
            canonical: languagePath(language, path),
            languages: languageAlternates(path),
          },
        }
      : {}),
    openGraph: {
      type: 'website',
      siteName: 'IGUA.DEV',
      locale: language === 'en' ? 'en_US' : 'es_AR',
      alternateLocale: language === 'en' ? 'es_AR' : 'en_US',
      title: socialTitle,
      ...(description ? { description } : {}),
      ...(path ? { url: languagePath(language, path) } : {}),
      images: [
        {
          url: `/social/${language}`,
          width: 1200,
          height: 630,
          alt: t('El futuro también se construye desde acá.'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      ...(description ? { description } : {}),
      images: [`/social/${language}`],
    },
  };
}
export const pageLabels: Record<string, string> = {
  '/': 'Inicio',
  '/about': 'Nosotros',
  '/events': 'Eventos',
  '/programs': 'Programas',
  '/projects': 'Proyectos',
  '/community': 'Comunidad',
  '/reglamento': 'Reglamento',
  '/partners': 'Aliados',
  '/recursos': 'Recursos',
  '/join': 'Sumate a la comunidad',
  '/privacy': 'Privacidad',
};
export function siteEntities(path: string, language: Language, title: string) {
  const origin = new URL('/', siteUrl).href;
  const canonical = new URL(languagePath(language, path), siteUrl).href;
  const organization = {
    '@type': 'Organization',
    '@id': `${origin}#organization`,
    name: 'IGUA.DEV',
    url: origin,
    description:
      language === 'en'
        ? 'Independent, technology-agnostic developer community based in Puerto Iguazú, Misiones, Argentina.'
        : 'Comunidad independiente y abierta de tecnología con base en Puerto Iguazú, Misiones, Argentina.',
    logo: { '@type': 'ImageObject', url: new URL('/brand/symbol.svg', siteUrl).href },
    location: {
      '@type': 'Place',
      name: 'Puerto Iguazú',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Puerto Iguazú',
        addressRegion: 'Misiones',
        addressCountry: 'AR',
      },
    },
  };
  const webpage = {
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: title,
    inLanguage: language === 'en' ? 'en' : 'es-AR',
    isPartOf: { '@id': `${origin}#website` },
    about: { '@id': `${origin}#organization` },
  };
  const breadcrumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: language === 'en' ? 'Home' : 'Inicio',
        item: new URL(languagePath(language, '/'), siteUrl).href,
      },
      ...(path === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: title, item: canonical }]),
    ],
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': `${origin}#website`,
        url: origin,
        name: 'IGUA.DEV',
        inLanguage: ['es-AR', 'en'],
        publisher: { '@id': `${origin}#organization` },
      },
      webpage,
      breadcrumbs,
    ],
  };
}
