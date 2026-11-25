import { pick, type Language } from '@/lib/i18n/routing';

const topics = {
  es: [
    'Programación',
    'Inteligencia artificial',
    'Blockchain',
    'Open Source',
    'Automatización',
    'Web3',
    'Emprendimiento',
    'Comunidad',
  ],
  pt: [
    'Programação',
    'Inteligência artificial',
    'Blockchain',
    'Open Source',
    'Automação',
    'Web3',
    'Empreendedorismo',
    'Comunidade',
  ],
  en: [
    'Coding',
    'Artificial intelligence',
    'Blockchain',
    'Open Source',
    'Automation',
    'Web3',
    'Entrepreneurship',
    'Community',
  ],
};

const places = {
  es: ['Puerto Iguazú', 'Misiones', 'Argentina', 'Triple Frontera'],
  pt: ['Puerto Iguazú', 'Misiones', 'Argentina', 'Tríplice Fronteira'],
  en: ['Puerto Iguazú', 'Misiones', 'Argentina', 'Triple Frontier'],
};

function Toucan() {
  return (
    <svg className="ribbon-mark" viewBox="0 0 240 200" aria-hidden="true">
      <path d="M8 192V160C8 74 64 12 140 12H146C99 32 72 66 72 111C72 148 89 176 114 192H8Z" />
      <path d="M140 12C196 12 236 51 236 119C202 100 166 103 126 128V48C126 29 130 19 140 12Z" />
      <rect x="87" y="69" width="20" height="20" rx="2" />
    </svg>
  );
}

function Track({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const run = (hidden: boolean) => (
    <div className="ribbon-run" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span className="ribbon-item" key={item}>
          {item}
          <Toucan />
        </span>
      ))}
    </div>
  );
  return (
    <div className={reverse ? 'ribbon-track is-reverse' : 'ribbon-track'}>
      {run(false)}
      {run(true)}
    </div>
  );
}

export function TopicRibbon({ language }: { language: Language }) {
  return (
    <section
      className="topic-ribbon"
      aria-label={pick(language, { es: 'Temas', pt: 'Temas', en: 'Topics' })}
    >
      <div className="ribbon ribbon-earth" aria-hidden="true">
        <Track items={pick(language, places)} reverse />
      </div>
      <div className="ribbon ribbon-green">
        <Track items={pick(language, topics)} />
      </div>
    </section>
  );
}
