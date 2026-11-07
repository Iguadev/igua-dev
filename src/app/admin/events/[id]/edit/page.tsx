import { getI18n } from '@/lib/i18n/server';
import Link from '@/components/localized-link';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { EventForm } from '@/components/event-form';
import { ActionForm, Field, TextArea } from '@/components/action-form';
import { staffMutation, uploadEventCover } from '@/features/admin/actions';
import type { Event } from '@/lib/data';
export default async function EditEvent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { t, language } = await getI18n();
  const member = await requireStaff();
  const { id } = await params;
  const { saved } = await searchParams;
  const [event, venues, programs] = await Promise.all([
    member.client.from('events').select('*').eq('id', id).maybeSingle(),
    member.client.from('venues').select('id,name'),
    member.client.from('programs').select('id,title'),
  ]);
  if (event.error || venues.error || programs.error) throw new Error('Could not load event editor');
  if (!event.data) notFound();
  return (
    <>
      <PageIntro label={t('Gestión del encuentro')} title={t('Editar evento.')} />
      {saved && (
        <div className="form-message" role="status">
          {t('Evento guardado.')}
        </div>
      )}
      <div className="toolbar">
        <Link href={`/admin/events/${id}/attendees`} className="text-link">
          {t('Ver inscripciones y asistencia ↗')}
        </Link>
        <Link href={`/events/${event.data.slug}`} className="text-link">
          {t('Ver página pública ↗')}
        </Link>
      </div>
      <EventForm event={event.data as Event} venues={venues.data} />
      <h2 className="section-title" style={{ marginTop: 50 }}>
        {t('Portada del evento.')}
      </h2>
      <ActionForm action={uploadEventCover} submit={t('Guardar portada')}>
        <input type="hidden" name="id" value={id} />
        <div>
          <label htmlFor="cover">{t('Imagen PNG, JPG o WebP, hasta 2 MB')}</label>
          <input
            id="cover"
            type="file"
            name="cover"
            accept="image/png,image/jpeg,image/webp"
            required
          />
        </div>
      </ActionForm>
      <h2 className="section-title" style={{ marginTop: 50 }}>
        {t('Agregar una persona invitada.')}
      </h2>
      <ActionForm action={staffMutation} submit={t('Agregar speaker')}>
        <input type="hidden" name="action" value="speaker" />
        <input type="hidden" name="event_id" value={id} />
        <Field name="display_name" label={t('Nombre público')} required />
        <TextArea name="bio" label={t('Bio (con autorización para publicar)')} maxLength={1500} />
      </ActionForm>
      <h2 className="section-title" style={{ marginTop: 50 }}>
        {t('Asociar a un programa.')}
      </h2>
      <ActionForm action={staffMutation} submit={t('Asociar programa')}>
        <input type="hidden" name="action" value="program_event" />
        <input type="hidden" name="event_id" value={id} />
        <div>
          <label htmlFor="program_id">{t('Programa')}</label>
          <select id="program_id" name="program_id" required>
            {programs.data.map((p) => (
              <option value={p.id} key={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </ActionForm>
    </>
  );
}
