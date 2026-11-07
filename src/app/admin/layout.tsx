import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
export const dynamic = 'force-dynamic';
import { requireStaff } from '@/features/auth/guards';
import { DashboardShell } from '@/components/dashboard-shell';
const pageMetadata = { title: 'Administración', robots: { index: false, follow: false } };
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const member = await requireStaff();
  return (
    <DashboardShell admin fullAdmin={member.roles.includes('admin')}>
      {children}
    </DashboardShell>
  );
}
