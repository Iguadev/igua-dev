import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from '@/components/localized-link';
import { MemberTicket } from '@/components/member-ticket';
import { publicMembers } from '@/features/members/directory';
import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import '@/components/member-ticket.css';

const pageMetadata = {
  title: 'Directorio de miembros',
  description: 'Conocé a quienes comparten su perfil y sus proyectos en IGUA.DEV.',
  alternates: { canonical: '/members' },
};

export async function generateMetadata() {
  return localizeMetadata(pageMetadata, (await getI18n()).language);
}

export default async function Members({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const [{ t }, query] = await Promise.all([getI18n(), searchParams]);
  const page =
    typeof query.page === 'string' && /^[1-9]\d{0,5}$/.test(query.page) ? Number(query.page) : 1;
  const { members, hasNextPage } = await publicMembers(page);

  return (
    <div className="container page-content">
      <div className="members-heading">
        <h1>{t('Directorio de miembros')}</h1>
        <p>{t('Conocé a quienes comparten su perfil y sus proyectos en IGUA.DEV.')}</p>
      </div>
      {members.length > 0 ? (
        <div className="member-ticket-grid">
          {members.map(({ id, ...member }) => (
            <MemberTicket key={id} member={member} />
          ))}
        </div>
      ) : (
        <div className="members-empty">
          <p>
            {t(
              page === 1
                ? 'Todavía no hay perfiles públicos en el directorio.'
                : 'No hay perfiles en esta página.',
            )}
          </p>
        </div>
      )}
      {(page > 1 || hasNextPage) && (
        <nav className="member-pagination" aria-label={t('Páginas del directorio')}>
          {page > 1 && (
            <Link
              className="text-link"
              href={page === 2 ? '/members' : `/members?page=${page - 1}`}
            >
              <ArrowLeft size={16} aria-hidden="true" /> {t('Anterior')}
            </Link>
          )}
          {hasNextPage && (
            <Link className="text-link" href={`/members?page=${page + 1}`}>
              {t('Siguiente')} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
