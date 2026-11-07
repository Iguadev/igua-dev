import { getI18n } from '@/lib/i18n/server';
import Link from '@/components/localized-link';
import { ActionForm } from './action-form';
import { signOut } from '@/features/auth/actions';
export async function DashboardShell({
  children,
  admin = false,
  fullAdmin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
  fullAdmin?: boolean;
}) {
  const { t, language } = await getI18n();
  const base = admin ? '/admin' : '/dashboard';
  const links = admin
    ? [
        ['', t('Resumen')],
        ['/events', t('Eventos')],
        ...(fullAdmin
          ? [
              ['/members', t('Integrantes')],
              ['/projects', t('Proyectos')],
              ['/partners', t('Alianzas')],
              ['/content', t('Contenido')],
              ['/settings', t('Configuración')],
            ]
          : []),
      ]
    : [
        ['', t('Mi espacio')],
        ['/profile', t('Mi perfil')],
        ['/events', t('Mis eventos')],
        ['/projects', t('Mis proyectos')],
        ['/settings', t('Configuración')],
      ];
  return (
    <div className="container">
      <div className="dashboard-layout">
        <aside className="sidebar">
          <h2>{admin ? t('Organización') : t('Tu comunidad')}</h2>
          <nav aria-label={admin ? t('Administración') : t('Miembro')}>
            {links.map(([path, label]) => (
              <Link key={path} href={`${base}${path}`}>
                {label}
              </Link>
            ))}
            {admin && <Link href="/dashboard">{t('Mi espacio')}</Link>}
          </nav>
          <ActionForm action={signOut} submit={t('Cerrar sesión')} />
        </aside>
        <div className="dashboard-main">{children}</div>
      </div>
    </div>
  );
}
