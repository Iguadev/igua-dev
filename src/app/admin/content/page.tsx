import { languagePath } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import { requireStaff } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { ActionForm, Field, TextArea } from '@/components/action-form';
import { staffMutation } from '@/features/admin/actions';
export default async function Content({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; program?: string }>;
}) {
  const { t, language } = await getI18n();
  const member = await requireStaff(true);
  const query = await searchParams;
  const [pages, programs] = await Promise.all([
    member.client.from('content_pages').select('*'),
    member.client.from('programs').select('*').order('sort_order'),
  ]);
  if (pages.error || programs.error) throw new Error('Could not load content');
  const page = pages.data.find((p) => p.slug === query.page);
  const program = programs.data.find((p) => p.slug === query.program);
  return (
    <>
      <PageIntro label={t('Palabras y programas')} title={t('Contenido.')} />
      <p style={{ marginBottom: 22 }}>
        {t(
          'Los slugs “about” y “origin” editan el texto principal de Nosotros y del bloque Built in Iguazú. El contenido se presenta como texto seguro.',
        )}
      </p>
      <div className="filter-bar">
        {pages.data.map((p) => (
          <a
            className="filter"
            href={languagePath(language, `/admin/content?page=${p.slug}`)}
            key={p.id}
          >
            {p.title}
          </a>
        ))}
      </div>
      <ActionForm key={page?.id || 'new'} action={staffMutation} submit={t('Guardar contenido')}>
        <input name="action" type="hidden" value="content" />
        <Field name="slug" label={t('Slug (about u origin)')} defaultValue={page?.slug} required />
        <Field name="title" label={t('Título')} defaultValue={page?.title} required />
        <TextArea
          name="body"
          label={t('Contenido')}
          defaultValue={page?.body}
          required
          minLength={20}
          maxLength={15000}
        />
        <label className="check-label">
          <input type="checkbox" name="published" defaultChecked={page?.published} />
          {t('Publicar contenido')}
        </label>
      </ActionForm>
      <h2 className="section-title" style={{ marginTop: 55 }}>
        {t('Programas.')}
      </h2>
      <div className="filter-bar">
        {programs.data.map((p) => (
          <a
            key={p.id}
            className="filter"
            href={languagePath(language, `/admin/content?program=${p.slug}`)}
          >
            {p.title}
          </a>
        ))}
      </div>
      <ActionForm
        key={program?.id || 'new-program'}
        action={staffMutation}
        submit={t('Guardar programa')}
      >
        <input type="hidden" name="action" value="program" />
        <Field
          name="slug"
          label={t('Identificador del programa')}
          defaultValue={program?.slug}
          required
        />
        <Field
          name="title"
          label={t('Nombre del programa')}
          defaultValue={program?.title}
          required
        />
        <TextArea
          name="description"
          label={t('Descripción')}
          defaultValue={program?.description}
          required
          minLength={20}
        />
        <div>
          <label htmlFor="accent">{t('Identidad visual')}</label>
          <select name="accent" id="accent" defaultValue={program?.accent || 'green'}>
            <option value="green">{t('Verde')}</option>
            <option value="purple">{t('Violeta')}</option>
            <option value="blue">{t('Azul')}</option>
            <option value="orange">{t('Terracota')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="program-status">{t('Estado')}</label>
          <select id="program-status" name="status" defaultValue={program?.status || 'draft'}>
            <option value="draft">{t('Borrador')}</option>
            <option value="planned">{t('En preparación')}</option>
            <option value="active">{t('Activo')}</option>
            <option value="archived">{t('Archivado')}</option>
          </select>
        </div>
        <Field
          name="sort_order"
          label={t('Orden de presentación')}
          type="number"
          defaultValue={program?.sort_order || 0}
        />
      </ActionForm>
    </>
  );
}
