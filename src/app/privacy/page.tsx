import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/sections';
const pageMetadata = { title: 'Privacidad', alternates: { canonical: '/privacy' } };
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Privacy() {
  const { t, language } = await getI18n();
  return (
    <div className="container page-content">
      <PageIntro
        label={t('Tus datos, tus decisiones')}
        title={t('Privacidad desde el primer día.')}
      />
      <div className="prose">
        <p>
          {t(
            'IGUA.DEV solicita los datos necesarios para gestionar tu cuenta, tus inscripciones y los proyectos que compartís. No vendemos tus datos ni compartimos tu email con aliados.',
          )}
        </p>
        <h2>{t('Tu perfil.')}</h2>
        <p>
          {t(
            'El nombre, la ciudad, la experiencia, los intereses, la bio y los enlaces que cargues nos ayudan a organizar la comunidad. El perfil es privado por defecto. Si elegís hacerlo público, se mostrarán tu nombre, ciudad, bio y enlace a GitHub en el directorio. Podés cambiar esa decisión desde tu perfil.',
          )}
        </p>
        <h2>{t('Eventos y proyectos.')}</h2>
        <p>
          {t(
            'La organización de un evento puede consultar sus inscripciones y asistencia. Los proyectos se publican luego de una revisión y según la visibilidad elegida por su autoría.',
          )}
        </p>
        <h2>{t('Comunicaciones.')}</h2>
        <p>
          {t(
            'Los emails necesarios para ingresar y confirmar inscripciones son parte del servicio. Las novedades de la comunidad requieren tu aceptación y podés desactivarlas desde tu perfil.',
          )}
        </p>
        <h2>{t('Proveedores técnicos.')}</h2>
        <p>
          {t(
            'La plataforma está preparada para usar Supabase en autenticación, base de datos y archivos; Resend para emails; Vercel para alojamiento y mediciones agregadas; Sentry para registrar errores técnicos. Estos servicios se conectarán antes de habilitar el registro. No se envían a monitoreo los datos de formularios ni información personal de manera intencional.',
          )}
        </p>
        <h2>{t('Acceso y eliminación.')}</h2>
        <p>
          {t(
            'Podés editar tus datos y solicitar la eliminación de la cuenta desde la configuración de tu espacio. Al recibir la solicitud ocultamos tu perfil público; la organización debe completar la eliminación, incluyendo archivos, y puede conservar registros mínimos cuando corresponda. No anunciamos un plazo de eliminación automático que el sistema todavía no garantiza.',
          )}
        </p>
        <h2>{t('Consultas de colaboración.')}</h2>
        <p>
          {t(
            'El formulario de alianzas guarda tu nombre, organización, email y mensaje para responderte y gestionar la propuesta. No te suscribe a novedades.',
          )}
        </p>
        <h2>{t('Antes de la apertura.')}</h2>
        <p>
          {t(
            'El registro permanece deshabilitado mientras no se conecten los servicios. Antes de la apertura, la organización debe publicar su identidad y un canal de contacto para consultas y derechos sobre datos personales.',
          )}
        </p>
      </div>
    </div>
  );
}
