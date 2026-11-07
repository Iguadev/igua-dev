import { languagePath } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import { requireMember } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { ActionForm, Field, TextArea } from '@/components/action-form';
import { saveProject } from '@/features/projects/actions';
async function ProjectForm({
  project,
}: {
  project?: {
    id: string;
    title: string;
    description: string;
    github_url: string;
    demo_url: string;
    visibility: string;
    project_technologies: { name: string }[];
  };
}) {
  const { t, language } = await getI18n();
  return (
    <ActionForm
      action={saveProject}
      submit={project ? t('Guardar y reenviar a revisión') : t('Enviar proyecto a revisión')}
    >
      {project && <input type="hidden" name="id" value={project.id} />}
      <Field
        name="title"
        label={t('Nombre del proyecto')}
        defaultValue={project?.title}
        required
        minLength={3}
        maxLength={100}
      />
      <TextArea
        name="description"
        label={t('Qué hace y qué estás construyendo')}
        defaultValue={project?.description}
        required
        minLength={30}
        maxLength={5000}
      />
      <Field
        name="technologies"
        label={t('Tecnologías, separadas por comas')}
        defaultValue={project?.project_technologies.map((t) => t.name).join(', ')}
        maxLength={300}
      />
      <Field
        name="github_url"
        label={t('Repositorio (opcional)')}
        type="url"
        defaultValue={project?.github_url || ''}
      />
      <Field
        name="demo_url"
        label={t('Demo (opcional)')}
        type="url"
        defaultValue={project?.demo_url || ''}
      />
      <div>
        <label htmlFor="visibility">{t('Visibilidad')}</label>
        <select name="visibility" id="visibility" defaultValue={project?.visibility || 'private'}>
          <option value="private">{t('Privado, solo mi cuenta y moderación')}</option>
          <option value="public">{t('Público después de la aprobación')}</option>
        </select>
      </div>
    </ActionForm>
  );
}
export default async function MyProjects({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { t, language } = await getI18n();
  const member = await requireMember();
  const query = await searchParams;
  const { data, error } = await member.client
    .from('projects')
    .select('*,project_technologies(name)')
    .eq('owner_id', member.user.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Could not load projects');
  const editing = data.find((p) => p.id === query.edit);
  return (
    <>
      <PageIntro label={t('Construí en voz alta')} title={t('Mis proyectos.')}>
        <p>
          {t(
            'Mostrá tu trabajo y encontrá oportunidades para colaborar. Cada edición vuelve a revisión antes de publicarse.',
          )}
        </p>
      </PageIntro>
      {!member.profile?.onboarded ? (
        <div className="notice">
          <a href={languagePath(language, '/dashboard/profile')}>{t('Completá tu perfil')}</a>
          {' ' + t('antes de enviar un proyecto.')}
        </div>
      ) : null}
      {data.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('Proyecto')}</th>
                <th>{t('Estado')}</th>
                <th>{t('Acción')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>
                    {p.status} / {p.visibility}
                  </td>
                  <td>
                    <a href={languagePath(language, `/dashboard/projects?edit=${p.id}`)}>
                      {t('Editar')}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h2 className="section-title">
        {editing ? t('Editar proyecto') : t('Compartí tu primer commit.')}
      </h2>
      <ProjectForm key={editing?.id || 'new'} project={editing} />
    </>
  );
}
