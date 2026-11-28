import { languagePath } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import Link from '@/components/localized-link';
import { PageIntro, ClosingCTA } from '@/components/sections';
const pageMetadata = {
  title: 'Una comunidad abierta',
  description: 'Conocé cómo participar en IGUA.DEV y nuestro código de convivencia.',
  alternates: { canonical: '/community' },
};
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Community() {
  const { t, language } = await getI18n();
  return (
    <>
      <div className="container page-content">
        <PageIntro label={t('Hay lugar para vos')} title={t('Tu stack no importa. Tus ganas, sí.')}>
          <p>
            {t(
              'Estés dando tus primeros pasos o lleves años construyendo, tu experiencia puede sumar algo que todavía nos falta.',
            )}
          </p>
        </PageIntro>
        <div className="two-column">
          <div className="prose">
            <h2>{t('Formas de participar.')}</h2>
            <p>
              {t(
                'Vení a un encuentro. Proponé un tema. Mostrá un proyecto. Ayudá a alguien con su primera contribución. La comunidad toma forma con lo que cada persona trae.',
              )}
            </p>
            <p>
              {t('Para empezar,') + ' '}
              <Link href={languagePath(language, '/join')}>{t('creá tu cuenta')}</Link>
              {' ' +
                t('y contanos qué te interesa. No hace falta tener un portfolio ni un título.')}
            </p>
            <h2>{t('Personas de la comunidad.')}</h2>
            <p>{t('Conocé a quienes comparten su perfil y sus proyectos en IGUA.DEV.')}</p>
            <Link href="/members">{t('Ver el directorio')}</Link>
          </div>
          <aside className="info-panel">
            <h2>{t('Desde Iguazú, con apertura.')}</h2>
            <p>
              {t(
                'Podés participar aunque vivas en otra ciudad. Cada evento indicará si es presencial, virtual o híbrido.',
              )}
            </p>
            <p>
              {t(
                'Los canales de conversación se publicarán cuando estén habilitados. Por ahora, el punto de entrada es tu cuenta de IGUA.DEV.',
              )}
            </p>
          </aside>
        </div>
        <div className="prose" id="convivencia">
          <p>
            <Link href="/reglamento">{t('Leer el reglamento completo')}</Link>
          </p>
          <h2>{t('Código de convivencia.')}</h2>
          <p>
            {t(
              'Queremos que este sea un espacio seguro para aprender y colaborar. Al participar, te comprometés a:',
            )}
          </p>
          <ul>
            <li>{t('Tratar a todas las personas con respeto, sin discriminación ni acoso.')}</li>
            <li>
              {t(
                'Hacer preguntas y dar feedback con buena fe. Criticamos ideas, sin atacar personas.',
              )}
            </li>
            <li>
              {t(
                'Respetar la privacidad. Pedí permiso antes de publicar fotos o datos de otras personas.',
              )}
            </li>
            <li>{t('Compartir conocimiento sin spam ni promoción insistente.')}</li>
            <li>{t('Respetar las licencias y reconocer el trabajo ajeno.')}</li>
          </ul>
          <p>
            {t(
              'Si una situación te incomoda durante un encuentro, hablá con la persona organizadora identificada en la página de ese evento. La organización podrá pedir que se detenga una conducta o retirar la participación para cuidar a la comunidad.',
            )}
          </p>
        </div>
      </div>
      <ClosingCTA />
    </>
  );
}
