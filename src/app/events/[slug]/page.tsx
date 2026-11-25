import { cache } from 'react';
import { getI18n } from '@/lib/i18n/server';
import { languagePath, languageTags, pick } from '@/lib/i18n/routing';
import { eventEntities, localizeMetadata } from '@/lib/seo';
import Link from '@/components/localized-link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { db } from '@/lib/supabase/server';
import { identity } from '@/features/auth/guards';
import { registrationAction } from '@/features/events/actions';
import { ActionForm } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/json-ld';
import { PageIntro } from '@/components/sections';
import { eventDate } from '@/lib/utils';
import type { Event } from '@/lib/data';
const findEvent = cache(async (slug: string) => {
  const client = await db();
  if (!client) return null;
  const { data, error } = await client
    .from('events')
    .select('*, venues(name,address,map_url)')
    .eq('slug', slug)
    .neq('status', 'draft')
    .maybeSingle();
  if (error) throw new Error('Could not load event');
  return data as Event | null;
});
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const [{ t, language }, { slug }] = await Promise.all([getI18n(), params]);
  const event = await findEvent(slug);
  return localizeMetadata(
    {
      title: event?.title || t('Evento no encontrado'),
      description: event?.description.slice(0, 160),
      alternates: { canonical: `/events/${slug}` },
      ...(event ? {} : { robots: { index: false, follow: true } }),
    },
    language,
  );
}
export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const [{ t, language }, { slug }, member] = await Promise.all([getI18n(), params, identity()]);
  const event = await findEvent(slug);
  if (!event) notFound();
  const client = member?.client ?? (await db());
  const [registrationResult, speakersResult, coverResult, availabilityResult] = await Promise.all([
    member
      ? member.client
          .from('event_registrations')
          .select('status')
          .eq('event_id', event.id)
          .eq('member_id', member.user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    client
      ? client.from('event_speakers').select('id,display_name,bio').eq('event_id', event.id)
      : Promise.resolve({ data: [] as { id: string; display_name: string; bio: string }[], error: null }),
    event.cover_path && client
      ? client.storage.from('covers').createSignedUrl(event.cover_path, 3600)
      : Promise.resolve({ data: null }),
    client
      ? client.rpc('event_availability', { p_event: event.id })
      : Promise.resolve({ data: null }),
  ]);
  const registration = registrationResult.data;
  const speakers = speakersResult.data;
  if ('error' in speakersResult && speakersResult.error) throw new Error('Could not load speakers');
  const cover = coverResult.data;
  const available = availabilityResult.data;
  const now = Date.now();
  const open =
    event.status === 'published' &&
    event.registration_status === 'open' &&
    now < Date.parse(event.starts_at) &&
    (!event.registration_opens_at || now >= Date.parse(event.registration_opens_at)) &&
    (!event.registration_closes_at || now < Date.parse(event.registration_closes_at));
  const registered = registration && registration.status !== 'cancelled';
  return (
    <div className="container page-content">
      <JsonLd data={eventEntities(language, event, cover?.signedUrl)} />
      <PageIntro label={event.category} title={event.title} />
      <div className="two-column">
        <div className="prose">
          {cover && (
            <div className="event-cover">
              <Image
                src={cover.signedUrl}
                unoptimized={process.env.NODE_ENV === 'development'}
                alt=""
                fill
                sizes="(max-width: 600px) 90vw, 45vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
          {language !== 'es' && (
            <p className="notice">
              {pick(language, {
                es: '',
                pt: 'Os detalhes do evento são informados pelos organizadores no idioma original.',
                en: 'Event details are provided by the organizers in their original language.',
              })}
            </p>
          )}
          <p>{event.description}</p>
          {speakers?.length ? (
            <>
              <h2>{t('Quiénes comparten.')}</h2>
              {speakers.map((s) => (
                <div key={s.id}>
                  <h3>{s.display_name}</h3>
                  <p>{s.bio}</p>
                </div>
              ))}
            </>
          ) : null}
          {event.recap && (
            <>
              <h2>{t('Lo que nos dejó el encuentro.')}</h2>
              <p>{event.recap}</p>
            </>
          )}
        </div>
        <aside className="info-panel">
          <span className="badge">
            {event.status === 'cancelled'
              ? t('Evento cancelado')
              : event.status === 'completed'
                ? t('Finalizado')
                : open
                  ? t('Inscripciones abiertas')
                  : t('Inscripciones cerradas')}
          </span>
          <dl>
            <dt>{t('Cuándo')}</dt>
            <dd>
              {eventDate(event.starts_at, event.time_zone, languageTags[language])}
              <br />
              <span className="muted">{t('Horario de Iguazú (UTC−3)')}</span>
            </dd>
            <dt>{t('Dónde')}</dt>
            <dd>
              {event.venues?.name || t('Lugar a confirmar')}
              <br />
              {event.venues?.address}
              {event.venues?.map_url && (
                <>
                  <br />
                  <a
                    href={event.venues.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    {t('Ver mapa')}
                  </a>
                </>
              )}
            </dd>
            <dt>{t('Capacidad')}</dt>
            <dd>
              {event.capacity}
              {' ' + t('lugares en total.')}
              {open && available !== null
                ? ` ${available} ${pick(language, {
                    es: 'disponibles. Si se completa, podés sumarte a la lista de espera.',
                    pt: 'disponíveis. Se lotar, você pode entrar na lista de espera.',
                    en: 'available. When full, you can join the waitlist.',
                  })}`
                : ''}
            </dd>
          </dl>
          {registered ? (
            <>
              <div className="form-message">
                {registration.status === 'waitlisted'
                  ? t('Estás en lista de espera.')
                  : t('Tu inscripción está confirmada.')}
              </div>
              {now < Date.parse(event.starts_at) && event.status !== 'completed' && (
                <ActionForm
                  action={registrationAction}
                  submit={t('Cancelar mi inscripción')}
                  danger
                >
                  <input type="hidden" name="event_id" value={event.id} />
                  <input type="hidden" name="intent" value="cancel" />
                </ActionForm>
              )}
            </>
          ) : open ? (
            member ? (
              member.profile?.onboarded ? (
                <ActionForm action={registrationAction} submit={t('Inscribirme')}>
                  <input type="hidden" name="event_id" value={event.id} />
                </ActionForm>
              ) : (
                <Button asChild>
                  <Link href={languagePath(language, '/dashboard/profile')}>
                    {t('Completar mi perfil')}
                  </Link>
                </Button>
              )
            ) : (
              <Button asChild>
                <Link href={`/login?next=${encodeURIComponent(`/events/${event.slug}`)}`}>
                  {t('Ingresar para inscribirme')}
                </Link>
              </Button>
            )
          ) : (
            <p>{t('Las inscripciones no están disponibles en este momento.')}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
