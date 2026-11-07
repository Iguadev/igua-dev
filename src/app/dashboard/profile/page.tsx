import { getI18n } from '@/lib/i18n/server';
import Image from 'next/image';
import { requireMember } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { ActionForm, Field, TextArea } from '@/components/action-form';
import { saveProfile, uploadAvatar } from '@/features/members/actions';
export default async function Profile() {
  const { t, language } = await getI18n();
  const member = await requireMember();
  const p = member.profile;
  const { data: avatar } = p?.avatar_path
    ? await member.client.storage.from('avatars').createSignedUrl(p.avatar_path, 3600)
    : { data: null };
  const [interests, selected, preferences] = await Promise.all([
    member.client.from('interests').select('id,name').order('name'),
    member.client.from('member_interests').select('interest_id').eq('member_id', member.user.id),
    member.client
      .from('member_preferences')
      .select('updates')
      .eq('member_id', member.user.id)
      .single(),
  ]);
  if (interests.error || selected.error || preferences.error)
    throw new Error('Could not load profile');
  const ids = selected.data.map((i) => i.interest_id);
  return (
    <>
      <PageIntro label={t('Conocernos es el primer paso')} title={t('Tu perfil, a tu manera.')}>
        <p>{t('Compartí lo que te represente. Tu email siempre es privado.')}</p>
      </PageIntro>
      <ActionForm action={saveProfile} submit={t('Guardar mi perfil')}>
        <Field
          name="display_name"
          label={t('¿Cómo te llamás?')}
          defaultValue={p?.display_name}
          required
          minLength={2}
          maxLength={80}
        />
        <div className="form-row">
          <Field
            name="city"
            label={t('Ciudad')}
            defaultValue={p?.city || 'Puerto Iguazú'}
            required
            maxLength={100}
          />
          <div>
            <label htmlFor="experience">{t('Tu experiencia')}</label>
            <select id="experience" name="experience" defaultValue={p?.experience || 'starting'}>
              <option value="starting">{t('Estoy empezando')}</option>
              <option value="student">{t('Estudiante')}</option>
              <option value="junior">Junior</option>
              <option value="mid">{t('Intermedia')}</option>
              <option value="senior">{t('Avanzada')}</option>
            </select>
          </div>
        </div>
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
      </ActionForm>
      <div style={{ marginTop: 50 }}>
        <h2 className="section-title">{t('Tu imagen (opcional).')}</h2>
        <p style={{ marginBottom: 20, fontSize: 13 }}>
          {t('La guardamos en tu espacio privado. PNG, JPG o WebP, hasta 2 MB.')}
        </p>
        {avatar && (
          <Image
            src={avatar.signedUrl}
            unoptimized
            alt={t('Tu imagen de perfil')}
            width={88}
            height={88}
            style={{ borderRadius: 8, objectFit: 'cover', marginBottom: 20 }}
          />
        )}
        <ActionForm action={uploadAvatar} submit={t('Guardar imagen')}>
          <div>
            <label htmlFor="avatar">{t('Elegí una imagen')}</label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required
            />
          </div>
        </ActionForm>
      </div>
    </>
  );
}
