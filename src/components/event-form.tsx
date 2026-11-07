import { getI18n } from '@/lib/i18n/server';
import { ActionForm, Field, TextArea } from './action-form';
import { saveEvent } from '@/features/admin/actions';
import type { Event } from '@/lib/data';
export async function EventForm({
  event,
  venues,
}: {
  event?: Event;
  venues: { id: string; name: string }[];
}) {
  const { t, language } = await getI18n();
  return (
    <ActionForm action={saveEvent} submit={event ? t('Guardar evento') : t('Crear borrador')}>
      {event && <input type="hidden" name="id" value={event.id} />}
      <Field
        name="title"
        label={t('Título')}
        defaultValue={event?.title}
        required
        minLength={3}
        maxLength={150}
      />
      <Field
        name="slug"
        label={t('Slug único (minúsculas y guiones)')}
        defaultValue={event?.slug}
        required
        maxLength={160}
      />
      <TextArea
        name="description"
        label={t('Descripción')}
        defaultValue={event?.description}
        required
        minLength={20}
        maxLength={15000}
      />
      <div className="form-row">
        <Field
          name="category"
          label={t('Categoría')}
          defaultValue={event?.category}
          required
          maxLength={60}
        />
        <Field
          name="capacity"
          label={t('Capacidad')}
          type="number"
          defaultValue={event?.capacity || 30}
          required
        />
      </div>
      <div className="notice">
        {t(
          'Usá fechas ISO con zona horaria. Ejemplo: 2027-03-20T18:00:00-03:00. La zona de presentación es Iguazú (UTC−3).',
        )}
      </div>
      <Field
        name="starts_at"
        label={t('Inicio')}
        defaultValue={event?.starts_at}
        placeholder="2027-03-20T18:00:00-03:00"
        required
      />
      <Field
        name="ends_at"
        label={t('Fin')}
        defaultValue={event?.ends_at}
        placeholder="2027-03-20T20:00:00-03:00"
        required
      />
      <Field
        name="registration_opens_at"
        label={t('Apertura de inscripción (opcional)')}
        defaultValue={event?.registration_opens_at || ''}
      />
      <Field
        name="registration_closes_at"
        label={t('Cierre de inscripción (opcional)')}
        defaultValue={event?.registration_closes_at || ''}
      />
      <div>
        <label htmlFor="venue_id">{t('Espacio')}</label>
        <select id="venue_id" name="venue_id" defaultValue={event?.venue_id || ''}>
          <option value="">{t('Lugar a confirmar')}</option>
          {venues.map((v) => (
            <option value={v.id} key={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div>
          <label htmlFor="status">{t('Publicación')}</label>
          <select id="status" name="status" defaultValue={event?.status || 'draft'}>
            <option value="draft">{t('Borrador')}</option>
            <option value="published">{t('Publicado')}</option>
            <option value="completed">{t('Finalizado')}</option>
            <option value="cancelled">{t('Cancelado')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="registration_status">{t('Inscripción')}</label>
          <select
            id="registration_status"
            name="registration_status"
            defaultValue={event?.registration_status || 'closed'}
          >
            <option value="closed">{t('Cerrada')}</option>
            <option value="open">{t('Abierta')}</option>
          </select>
        </div>
      </div>
      <TextArea
        name="recap"
        label={t('Resumen posterior (opcional)')}
        defaultValue={event?.recap || ''}
        maxLength={15000}
      />
    </ActionForm>
  );
}
