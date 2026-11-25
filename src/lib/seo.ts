import type { Metadata } from 'next';
import english from './i18n/en.json';
import portuguese from './i18n/pt.json';
import {
  languagePath,
  languages,
  languageTags,
  ogLocales,
  pick,
  translator,
  type Language,
} from './i18n/routing';
import { productionSiteUrl, siteUrl } from './env';
const publicOrigin = productionSiteUrl;
const dictionaries: Record<Language, Record<string, string>> = {
  es: {},
  pt: portuguese,
  en: english,
};
export function languageAlternates(
  path: string,
  origin: string = productionSiteUrl,
): Record<string, string> {
  return {
    ...Object.fromEntries(
      languages.map((l) => [languageTags[l], new URL(languagePath(l, path), origin).href]),
    ),
    'x-default': new URL(languagePath('es', path), origin).href,
  };
}
export function localizeMetadata(metadata: Metadata, language: Language): Metadata {
  const t = translator(language, dictionaries[language]);
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
    applicationName: 'IGUA.DEV',
    authors: [{ name: 'IGUA.DEV', url: productionSiteUrl }],
    creator: 'IGUA.DEV',
    publisher: 'IGUA.DEV',
    category: 'technology',
    formatDetection: { email: false, telephone: false, address: false },
    ...metadata,
    title,
    description,
    ...(path
      ? {
          alternates: {
            canonical: languagePath(language, path),
            languages: languageAlternates(path, siteUrl),
          },
        }
      : {}),
    openGraph: {
      type: 'website',
      siteName: 'IGUA.DEV',
      locale: ogLocales[language],
      alternateLocale: languages.filter((l) => l !== language).map((l) => ogLocales[l]),
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
const topicNames = (language: Language) =>
  pick(language, {
    es: [
      'ingeniería de software',
      'open source',
      'inteligencia artificial',
      'automatización',
      'tecnologías emergentes',
      'emprendimiento',
    ],
    pt: [
      'engenharia de software',
      'open source',
      'inteligência artificial',
      'automação',
      'tecnologias emergentes',
      'empreendedorismo',
    ],
    en: [
      'software engineering',
      'open source',
      'artificial intelligence',
      'automation',
      'emerging technology',
      'entrepreneurship',
    ],
  });
export function siteEntities(path: string, language: Language, title: string) {
  const origin = new URL('/', publicOrigin).href;
  const canonical = new URL(languagePath(language, path), publicOrigin).href;
  const searchPath = languagePath(language, '/recursos');
  const organization = {
    '@type': 'Organization',
    '@id': `${origin}#organization`,
    name: 'IGUA.DEV',
    url: origin,
    description: pick(language, {
      es: 'Comunidad independiente y abierta de tecnología con base en Puerto Iguazú, Misiones, Argentina.',
      pt: 'Comunidade independente e aberta de tecnologia com base em Puerto Iguazú, Misiones, Argentina.',
      en: 'Independent, technology-agnostic developer community based in Puerto Iguazú, Misiones, Argentina.',
    }),
    logo: { '@type': 'ImageObject', url: new URL('/brand/symbol.svg', publicOrigin).href },
    foundingLocation: {
      '@type': 'Place',
      name: 'Puerto Iguazú',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Puerto Iguazú',
        addressRegion: 'Misiones',
        addressCountry: 'AR',
      },
    },
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
    areaServed: [
      { '@type': 'City', name: 'Puerto Iguazú' },
      { '@type': 'AdministrativeArea', name: 'Misiones' },
      { '@type': 'Country', name: 'AR' },
    ],
    knowsAbout: topicNames(language),
  };
  const webpage = {
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: title,
    inLanguage: languageTags[language],
    isPartOf: { '@id': `${origin}#website` },
    about: { '@id': `${origin}#organization` },
  };
  const breadcrumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: pick(language, { es: 'Inicio', pt: 'Início', en: 'Home' }),
        item: new URL(languagePath(language, '/'), publicOrigin).href,
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
        inLanguage: languages.map((l) => languageTags[l]),
        publisher: { '@id': `${origin}#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${new URL(searchPath, publicOrigin).href}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      webpage,
      breadcrumbs,
    ],
  };
}
export function faqEntities(
  language: Language,
  faqs: { question: string; answer: string }[],
) {
  const canonical = new URL(languagePath(language, '/about'), publicOrigin).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${canonical}#faq`,
    url: canonical,
    inLanguage: languageTags[language],
    isPartOf: { '@id': `${canonical}#webpage` },
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}
export function eventEntities(
  language: Language,
  event: {
    slug: string;
    title: string;
    description: string;
    starts_at: string;
    ends_at: string;
    status: string;
    venues: { name: string; address: string } | null;
  },
  image?: string | null,
) {
  const origin = new URL('/', publicOrigin).href;
  const url = new URL(languagePath(language, `/events/${event.slug}`), publicOrigin).href;
  const cancelled = event.status === 'cancelled';
  const completed = event.status === 'completed';
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${url}#event`,
    name: event.title,
    description: event.description,
    startDate: event.starts_at,
    endDate: event.ends_at,
    inLanguage: languageTags[language],
    eventStatus: `https://schema.org/${cancelled ? 'EventCancelled' : completed ? 'EventCompleted' : 'EventScheduled'}`,
    eventAttendanceMode: event.venues ? 'https://schema.org/OfflineEventAttendanceMode' : undefined,
    location: event.venues
      ? {
          '@type': 'Place',
          name: event.venues.name,
          address: event.venues.address,
        }
      : {
          '@type': 'Place',
          name: 'Puerto Iguazú',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Puerto Iguazú',
            addressRegion: 'Misiones',
            addressCountry: 'AR',
          },
        },
    organizer: { '@id': `${origin}#organization` },
    isAccessibleForFree: true,
    ...(image ? { image } : {}),
    url,
  };
}
export function projectEntities(
  language: Language,
  project: {
    slug: string;
    title: string;
    description: string;
    github_url: string | null;
    demo_url: string | null;
  },
) {
  const origin = new URL('/', publicOrigin).href;
  const url = new URL(languagePath(language, `/projects/${project.slug}`), publicOrigin).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${url}#project`,
    name: project.title,
    description: project.description,
    url,
    inLanguage: languageTags[language],
    creator: { '@id': `${origin}#organization` },
    ...(project.github_url || project.demo_url
      ? {
          sameAs: [project.github_url, project.demo_url].filter(
            (value): value is string => !!value,
          ),
        }
      : {}),
  };
}
export function itemListEntities(
  language: Language,
  path: string,
  name: string,
  items: { name: string; url: string }[],
) {
  const canonical = new URL(languagePath(language, path), publicOrigin).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${canonical}#list`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
