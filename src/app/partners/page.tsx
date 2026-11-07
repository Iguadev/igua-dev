import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/sections';
import { ActionForm, Field, TextArea } from '@/components/action-form';
import { partners } from '@/lib/data';
import { supabaseConfig } from '@/lib/env';
import { submitInquiry } from '@/features/partners/actions';
const pageMetadata = {
  title: 'Construyamos oportunidades juntos',
  description: 'Apoyá el talento de Puerto Iguazú. Proponé una colaboración con IGUA.DEV.',
  alternates: { canonical: '/partners' },
};
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Partners() {
  const { t, language } = await getI18n();
  const all = await partners();
  const enabled =
    !!supabaseConfig() && !!process.env.SUPABASE_SECRET_KEY && !!process.env.RATE_LIMIT_SECRET;
  return (
    <div className="container page-content">
      <PageIntro
        label={t('Aliados de la comunidad')}
        title={t('El talento local necesita oportunidades reales.')}
      >
        <p>
          {t(
            'Tu organización puede ayudar a que más personas aprendan, se conecten y construyan tecnología desde Iguazú.',
          )}
        </p>
      </PageIntro>
      <div className="two-column">
        <div className="prose">
          <h2>{t('Colaborar puede tomar muchas formas.')}</h2>
          <p>
            {t(
              'Un espacio para encontrarnos. Una persona que comparta su experiencia. Recursos para un taller. Apoyo para que una buena idea se convierta en un proyecto.',
            )}
          </p>
          <ul>
            <li>{t('Colaboración tecnológica y mentorías.')}</li>
            <li>{t('Vínculos con instituciones educativas.')}</li>
            <li>{t('Apoyo a encuentros y actividades.')}</li>
            <li>{t('Espacios y equipamiento.')}</li>
            <li>{t('Oportunidades para quienes empiezan.')}</li>
          </ul>
          <h2>{t('Una misión compartida.')}</h2>
          <p>
            {t(
              'Priorizamos propuestas que aporten valor a las personas y respeten la independencia de la comunidad. Colaborar no implica acceder a datos privados de sus integrantes.',
            )}
          </p>
          <h2>{t('Alianzas confirmadas.')}</h2>
          {all.length ? (
            <div className="stack">
              {all.map((p) => (
                <div key={p.id}>
                  {p.website ? (
                    <a href={p.website} target="_blank" rel="noopener noreferrer">
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                  <p>{p.category}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>
              {t(
                'Todavía no hay alianzas publicadas. Este espacio mostrará únicamente colaboraciones confirmadas.',
              )}
            </p>
          )}
        </div>
        <section className="info-panel" id="colaborar">
          <h2>{t('Conversemos.')}</h2>
          <p>
            {t(
              'Contanos qué tenés en mente. Usaremos tu email solamente para responder a esta consulta.',
            )}
          </p>
          {!enabled && (
            <div className="notice">
              {t(
                'El canal de consultas está en preparación. El formulario se habilitará cuando abramos la comunidad.',
              )}
            </div>
          )}
          <ActionForm action={submitInquiry} submit={t('Enviar propuesta')} disabled={!enabled}>
            <Field name="name" label={t('Tu nombre')} required maxLength={100} />
            <Field
              name="email"
              label={t('Email de contacto')}
              type="email"
              required
              maxLength={254}
            />
            <Field
              name="organization"
              label={t('Organización o iniciativa')}
              required
              maxLength={150}
            />
            <div>
              <label htmlFor="category">{t('Tipo de colaboración')}</label>
              <select id="category" name="category">
                <option value="technology">{t('Tecnología')}</option>
                <option value="education">{t('Educación')}</option>
                <option value="community">{t('Apoyo a la comunidad')}</option>
                <option value="event">{t('Eventos')}</option>
                <option value="venue">{t('Espacios')}</option>
              </select>
            </div>
            <TextArea
              name="message"
              label={t('¿Cómo te gustaría colaborar?')}
              required
              minLength={20}
              maxLength={3000}
            />
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="website_check">{t('Dejá este campo vacío')}</label>
              <input id="website_check" name="website_check" tabIndex={-1} autoComplete="off" />
            </div>
            <label className="check-label">
              <input type="checkbox" name="consent" required />
              {t(
                'Acepto que IGUA.DEV use estos datos para responder mi consulta. Leí la política de privacidad.',
              )}
            </label>
          </ActionForm>
        </section>
      </div>
    </div>
  );
}
