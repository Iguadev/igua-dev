import Link from '@/components/localized-link';
import { PageIntro } from '@/components/sections';
import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
const pageMetadata = {
  title: 'Reglamento de la comunidad',
  description:
    'Cómo nos cuidamos al aprender y construir en IGUA.DEV, desde Puerto Iguazú hacia el mundo.',
  alternates: { canonical: '/reglamento' },
};
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Guidelines() {
  const { t } = await getI18n();
  return (
    <div className="container page-content">
      <PageIntro
        label={t('Reglamento de la comunidad')}
        title={t('Un espacio que cuidamos entre todos.')}
      >
        <p>
          {t(
            'Estas reglas acompañan nuestra forma de aprender, compartir y colaborar. Participar en IGUA.DEV implica respetarlas, tanto en persona como en línea.',
          )}
        </p>
      </PageIntro>
      <p className="guidelines-version">{t('Versión 1.0 · 7 de noviembre de 2026')}</p>
      <div className="guidelines-layout">
        <nav className="guidelines-index" aria-label={t('En esta página')}>
          <h2>{t('En esta página')}</h2>
          <ul>
            <li>
              <a href="#alcance">{t('Propósito y alcance')}</a>
            </li>
            <li>
              <a href="#respeto">{t('Aprender con respeto')}</a>
            </li>
            <li>
              <a href="#limites">{t('Conductas que no aceptamos')}</a>
            </li>
            <li>
              <a href="#privacidad">{t('Privacidad y consentimiento')}</a>
            </li>
            <li>
              <a href="#canales">{t('Canales, anuncios y oportunidades')}</a>
            </li>
            <li>
              <a href="#ayuda">{t('Cómo pedir ayuda o reportar')}</a>
            </li>
            <li>
              <a href="#moderacion">{t('Respuesta de la organización')}</a>
            </li>
            <li>
              <a href="#actualizaciones">{t('Un reglamento que puede mejorar')}</a>
            </li>
          </ul>
        </nav>
        <article className="prose guidelines-copy">
          <section id="alcance">
            <h2>{t('Propósito y alcance')}</h2>
            <p>
              {t(
                'IGUA.DEV nace en Puerto Iguazú, Misiones, para acercar personas a la tecnología. No necesitás vivir acá, tener experiencia ni usar una herramienta determinada para participar. La diversidad de países, idiomas, culturas y conocimientos es parte de lo que queremos construir.',
              )}
            </p>
            <p>
              {t(
                'El reglamento alcanza a integrantes, organización, speakers, mentores, colaboradores, sponsors e invitados en actividades y canales oficiales, y en contactos privados vinculados con la comunidad.',
              )}
            </p>
          </section>
          <section id="respeto">
            <h2>{t('Aprender con respeto')}</h2>
            <p>
              {t(
                'Explicá sin descalificar. Dales lugar a las preguntas de quienes empiezan y ofrecé críticas sobre el trabajo, sin atacar a la persona. No te burles de un acento, un idioma o una dificultad para expresarse.',
              )}
            </p>
            <p>
              {t(
                'Pedí permiso antes de ayudar sobre un dispositivo o repositorio ajeno. Reconocé contribuciones, respetá licencias y compartí recursos de manera que otras personas puedan aprender.',
              )}
            </p>
          </section>
          <section id="limites">
            <h2>{t('Conductas que no aceptamos')}</h2>
            <p>
              {t(
                'No se permiten discriminación, humillaciones, acoso, amenazas, intimidación ni contenido sexual dirigido a incomodar. Esto incluye ataques por origen, nacionalidad, género, orientación sexual, edad, discapacidad, religión, apariencia o situación económica.',
              )}
            </p>
            <p>
              {t(
                'Respetá los límites: no insistas con mensajes, contacto físico o invitaciones después de una negativa. Tampoco aceptamos interrupciones deliberadas, suplantación de identidad, estafas, enlaces maliciosos ni represalias contra quien plantea una preocupación.',
              )}
            </p>
          </section>
          <section id="privacidad">
            <h2>{t('Privacidad y consentimiento')}</h2>
            <p>
              {t(
                'Antes de publicar fotos, grabaciones, capturas o conversaciones, pedí el consentimiento de las personas involucradas. No difundas datos personales, credenciales ni información privada de proyectos. Una actividad pública no da permiso para exponer a sus participantes.',
              )}
            </p>
            <p>
              {t(
                'En los eventos, respetá las indicaciones sobre fotografía y las preferencias de quienes no quieren aparecer. Consultá también nuestra política de privacidad para conocer el tratamiento de datos del sitio.',
              )}
            </p>
            <p>
              <Link href="/privacy">{t('Privacidad')}</Link>
            </p>
          </section>
          <section id="canales">
            <h2>{t('Canales, anuncios y oportunidades')}</h2>
            <p>
              {t(
                'Las preguntas, recursos y proyectos son bienvenidos en el espacio adecuado. Evitá el spam, las publicaciones repetidas y los mensajes privados masivos. Identificá cualquier interés comercial al recomendar un producto o servicio.',
              )}
            </p>
            <p>
              {t(
                'Coordiná con la administración antes de publicar promociones, búsquedas laborales, convocatorias externas o anuncios en nombre de IGUA.DEV. Una colaboración o un enlace compartido no implica un respaldo oficial.',
              )}
            </p>
          </section>
          <section id="ayuda">
            <h2>{t('Cómo pedir ayuda o reportar')}</h2>
            <p>
              {t(
                'Si algo ocurre durante un encuentro, buscá a la persona organizadora identificada en su página o al equipo responsable presente. Podés pedir hablar en privado y contar solo lo que te resulte posible. No hace falta confrontar a la otra persona.',
              )}
            </p>
            <p>
              {t(
                'Para situaciones en línea, usá el contacto privado de moderación que la organización anuncie en ese canal. Si podés, indicá qué pasó, dónde, cuándo y qué ayuda necesitás. Conservá evidencia de forma privada; no publiques datos de las personas involucradas en el grupo.',
              )}
            </p>
            <p>
              {t(
                'El canal específico de reportes todavía no está habilitado en este sitio. Esta página no recibe denuncias ni ofrece atención de emergencia. Ante un peligro inmediato, priorizá alejarte de la situación y buscar asistencia local.',
              )}
            </p>
          </section>
          <section id="moderacion">
            <h2>{t('Respuesta de la organización')}</h2>
            <p>
              {t(
                'La organización buscará escuchar a las personas involucradas y limitar la información compartida a quienes necesiten intervenir. No puede prometer confidencialidad absoluta ni plazos de respuesta que todavía no estén definidos.',
              )}
            </p>
            <p>
              {t(
                'Según la gravedad y el contexto, podrá pedir que una conducta se detenga, retirar contenido, advertir, limitar el acceso o excluir temporal o permanentemente a una persona. Una situación grave puede requerir actuar de inmediato, sin advertencia previa.',
              )}
            </p>
            <p>
              {t(
                'Si una medida te involucra, podés solicitar una revisión por el contacto privado de la organización. Si la preocupación involucra a una persona organizadora, buscá a otra integrante del equipo cuando sea posible.',
              )}
            </p>
          </section>
          <section id="actualizaciones">
            <h2>{t('Un reglamento que puede mejorar')}</h2>
            <p>
              {t(
                'La organización podrá actualizar estas reglas y señalará acá la versión vigente. Las propuestas de mejora se pueden acercar a quienes organicen las actividades. Cuidar la comunidad también es revisar cómo la estamos cuidando.',
              )}
            </p>
          </section>
          <footer className="guidelines-source">
            <p>
              {t('Referencia para esta adaptación:')}{' '}
              <a href="https://salta.dev/reglamento/" target="_blank" rel="noopener noreferrer">
                {t('Reglamento de Salta.dev')}
              </a>
              .
            </p>
            <p>{t('Redacción propia para la realidad y los canales actuales de IGUA.DEV.')}</p>
          </footer>
        </article>
      </div>
    </div>
  );
}
