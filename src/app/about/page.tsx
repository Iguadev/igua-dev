import { JsonLd } from '@/components/json-ld';
import { siteUrl } from '@/lib/env';
import { languagePath } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import Link from '@/components/localized-link';
import { ClosingCTA, PageIntro } from '@/components/sections';
import { content } from '@/lib/data';
const pageMetadata = {
  title: 'Desde Iguazú, hacia el mundo',
  description:
    'La misión y los valores de IGUA.DEV, una comunidad independiente de tecnología en Puerto Iguazú.',
  alternates: { canonical: '/about' },
};
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function About() {
  const { t, language } = await getI18n();
  const page = await content('about');
  const faqs =
    language === 'en'
      ? [
          {
            question: 'What is IGUA.DEV?',
            answer:
              'IGUA.DEV is an independent, technology-agnostic community based in Puerto Iguazú, Misiones, Argentina. It connects developers, students, designers, founders, and people curious about technology.',
          },
          {
            question: 'Can I take part from outside Iguazú?',
            answer:
              'Yes. People from other cities and countries are welcome. Each published event will state whether it is in person, online, or hybrid.',
          },
          {
            question: 'Is membership free?',
            answer:
              'Yes. Membership is free and open to people at every experience level. Registration opens once the community services are connected.',
          },
          {
            question: 'What can I learn here?',
            answer:
              'Explore software engineering, open source, AI, automation, blockchain and emerging technology, and entrepreneurship. The resources library links to tutorials and documentation from the people who make the tools.',
          },
        ]
      : [
          {
            question: '¿Qué es IGUA.DEV?',
            answer:
              'IGUA.DEV es una comunidad independiente y abierta de tecnología con base en Puerto Iguazú, Misiones, Argentina. Conecta a developers, estudiantes, diseñadores, founders y personas curiosas por la tecnología.',
          },
          {
            question: '¿Puedo participar desde fuera de Iguazú?',
            answer:
              'Sí. Recibimos a personas de otras ciudades y países. Cada evento publicado indicará si es presencial, virtual o híbrido.',
          },
          {
            question: '¿La membresía es gratuita?',
            answer:
              'Sí. La membresía es gratuita y está abierta a todos los niveles de experiencia. El registro se habilitará cuando se conecten los servicios de la comunidad.',
          },
          {
            question: '¿Qué puedo aprender acá?',
            answer:
              'Podés explorar software, open source, inteligencia artificial, automatización, blockchain y tecnologías emergentes, y emprendimientos. La biblioteca de recursos reúne tutoriales y documentación de quienes crean las herramientas.',
          },
        ];
  return (
    <>
      <div className="container page-content">
        <PageIntro
          label={t('Nuestra historia')}
          title={page?.title || t('El talento está acá. Las oportunidades también pueden estarlo.')}
        >
          <p>
            {t(
              'IGUA.DEV nace para conectar a quienes quieren aprender, crear y hacer crecer la tecnología desde Puerto Iguazú.',
            )}
          </p>
        </PageIntro>
        <div className="two-column">
          <div className="prose">
            <h2>{t('Un punto de encuentro.')}</h2>
            <p>
              {page?.body ||
                t(
                  'Somos una comunidad independiente de developers, estudiantes, diseñadores, founders y personas curiosas por la tecnología. Queremos que una idea encuentre a su equipo, que una pregunta abra una conversación y que aprender no sea una tarea solitaria.',
                )}
            </p>
            <p>
              {t(
                'Nuestra ciudad es parte de una región que conecta Argentina, Brasil y Paraguay. Esa cercanía nos inspira a pensar sin fronteras, con los pies en Iguazú.',
              )}
            </p>
            <h2>{t('Construir desde donde estamos.')}</h2>
            <p>
              {t(
                'No hace falta esperar a mudarse a una capital tecnológica para empezar. Queremos crear espacios para compartir conocimiento y convertir problemas reales en proyectos útiles.',
              )}
            </p>
            <h2>{t('Una comunidad, muchos caminos.')}</h2>
            <p>
              {t(
                'Nos interesa el software, el diseño, los datos, la inteligencia artificial, las tecnologías emergentes y todo lo que todavía nos queda por descubrir. Ninguna tecnología define quién puede participar.',
              )}
            </p>
          </div>
          <aside className="info-panel">
            <h2>{t('Lo que nos guía.')}</h2>
            <div className="stack">
              <p>
                <strong>{t('Puertas abiertas.')}</strong>
                <br />
                {t('Empezar de cero también es empezar.')}
              </p>
              <p>
                <strong>{t('Aprender haciendo.')}</strong>
                <br />
                {t('Preguntar, probar, equivocarse y volver a intentar.')}
              </p>
              <p>
                <strong>{t('Compartir para crecer.')}</strong>
                <br />
                {t('El conocimiento vale más cuando circula.')}
              </p>
              <p>
                <strong>{t('Respeto por las personas.')}</strong>
                <br />
                {t('La diversidad de experiencias nos hace mejores.')}
              </p>
            </div>
          </aside>
        </div>
        <div className="prose">
          <h2>{t('La organización también se construye.')}</h2>
          <p>
            {t(
              'Estamos en la etapa inicial. Publicaremos los perfiles de quienes organizan cuando estén confirmados y autoricen compartirlos.',
            )}
          </p>
          <Link href={languagePath(language, '/join')}>
            {t('Sumate a construir esta comunidad.')}
          </Link>
        </div>
        <section className="community-faq" aria-labelledby="faq-title">
          <h2 id="faq-title">
            {language === 'en' ? 'A few things worth knowing.' : 'Algunas respuestas para empezar.'}
          </h2>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
          <Link className="text-link" href="/recursos">
            {language === 'en' ? 'Explore the resources' : 'Explorar recursos'}
          </Link>
        </section>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            '@id': new URL(languagePath(language, '/about'), siteUrl).href + '#webpage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }}
        />
      </div>
      <ClosingCTA />
    </>
  );
}
