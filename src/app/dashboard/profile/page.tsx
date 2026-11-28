import { getI18n } from '@/lib/i18n/server';
import { ChevronDown, LockKeyhole } from 'lucide-react';
import { requireMember } from '@/features/auth/guards';
import { signOut } from '@/features/auth/actions';
import { ActionForm, Field, TextArea } from '@/components/action-form';
import { SelectField } from '@/components/ui/choice-field';
import { MemberTicket } from '@/components/member-ticket';
import { ProfileLocationFields } from '@/components/profile-location-fields';
import { ProfilePhoto } from '@/components/profile-photo';
import Link from '@/components/localized-link';
import { ownMemberTicket } from '@/features/members/directory';
import { saveProfile } from '@/features/members/actions';
import { countryOptions, savedCountryCode } from '@/lib/countries';
export default async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ t, language }, member, { next }] = await Promise.all([
    getI18n(),
    requireMember(),
    searchParams,
  ]);
  const p = member.profile;
  const [interests, selected, preferences, { data: avatar }, ticket] = await Promise.all([
    member.client.from('interests').select('id,name').order('name'),
    member.client.from('member_interests').select('interest_id').eq('member_id', member.user.id),
    member.client
      .from('member_preferences')
      .select('updates,country')
      .eq('member_id', member.user.id)
      .single(),
    p?.onboarded && p.avatar_path
      ? member.client.storage.from('avatars').createSignedUrl(p.avatar_path, 3600)
      : { data: null },
    p?.onboarded ? ownMemberTicket(member.user.id) : null,
  ]);
  if (interests.error || selected.error || preferences.error)
    throw new Error('Could not load profile');
  const ids = selected.data.map((i) => i.interest_id);
  return (
    <section className="member-profile" aria-labelledby="member-profile-title">
      <div className="profile-heading">
        <div>
          <h1 id="member-profile-title">
            {p?.onboarded ? t('Mi perfil') : t('Completá tu perfil')}
          </h1>
          <p>
            {p?.onboarded
              ? t('Editá tu información y elegí qué querés compartir en el directorio.')
              : t('Completá estos datos para entrar a tu espacio.')}
          </p>
        </div>
        {!p?.onboarded && (
          <ActionForm action={signOut} submit={t('Cerrar sesión')} className="profile-signout" />
        )}
      </div>
      {ticket && (
        <div className="profile-ticket-preview">
          <MemberTicket member={ticket} />
          <p>
            {p.public_profile ? (
              <Link className="text-link" href="/members">
                {t('Visible en el directorio')}
              </Link>
            ) : (
              t('Vista previa privada')
            )}
          </p>
        </div>
      )}
      <ActionForm
        action={saveProfile}
        submit={p?.onboarded ? t('Guardar mi perfil') : t('Crear mi perfil')}
        className="profile-form"
      >
        {!p?.onboarded && typeof next === 'string' && (
          <input type="hidden" name="next" value={next} />
        )}
        <Field
          name="display_name"
          label={t('¿Cómo te llamás?')}
          defaultValue={p?.display_name}
          required
          minLength={2}
          maxLength={80}
          autoComplete="nickname"
        />
        <ProfileLocationFields
          countries={countryOptions(language)}
          savedCountry={savedCountryCode(preferences.data.country)}
          savedCity={p?.city || null}
        />
        <SelectField
          name="experience"
          label={t('Tu experiencia')}
          defaultValue={p?.experience || 'starting'}
          options={[
            { value: 'starting', label: t('Estoy empezando') },
            { value: 'student', label: t('Estudiante') },
            { value: 'junior', label: 'Junior' },
            { value: 'mid', label: t('Intermedia') },
            { value: 'senior', label: t('Avanzada') },
          ]}
        />
        <details className="profile-details" open={p?.onboarded || undefined}>
          <summary>
            {t('Detalles del perfil y preferencias (opcional)')}
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div className="profile-details-content">
            <fieldset>
              <legend>{t('¿Qué te interesa?')}</legend>
              {interests.data.map((i) => (
                <label className="check-label" key={i.id}>
                  <input
                    type="checkbox"
                    name="interests"
                    value={i.id}
                    defaultChecked={ids.includes(i.id)}
                  />
                  {t(i.name)}
                </label>
              ))}
            </fieldset>
            <Field
              name="github_url"
              label={t('GitHub (opcional)')}
              type="url"
              defaultValue={p?.github_url || ''}
              placeholder="https://github.com/tu-usuario"
            />
            <Field
              name="linkedin_url"
              label={t('LinkedIn (opcional)')}
              type="url"
              defaultValue={p?.linkedin_url || ''}
            />
            <Field
              name="website"
              label={t('Tu web (opcional)')}
              type="url"
              defaultValue={p?.website || ''}
            />
            <TextArea
              name="bio"
              label={t('Algo sobre vos (hasta 500 caracteres)')}
              defaultValue={p?.bio || ''}
              maxLength={500}
            />
            <label className="check-label">
              <input
                type="checkbox"
                name="public_profile"
                defaultChecked={p?.public_profile || false}
              />
              {t('Quiero mostrar mi nombre, ciudad, bio y GitHub en el directorio público.')}
            </label>
            <label className="check-label">
              <input type="checkbox" name="updates" defaultChecked={preferences.data.updates} />
              {t('Quiero recibir novedades de la comunidad. Puedo cambiarlo cuando quiera.')}
            </label>
          </div>
        </details>
        <p className="profile-privacy">
          <LockKeyhole size={15} aria-hidden="true" />
          {t('Tu perfil es privado por defecto.')}
        </p>
      </ActionForm>
      {p?.onboarded && <ProfilePhoto savedPhoto={avatar?.signedUrl} />}
    </section>
  );
}
