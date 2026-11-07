import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
export const dynamic = 'force-dynamic';
import { requireMember } from '@/features/auth/guards';
import { DashboardShell } from '@/components/dashboard-shell';
const pageMetadata = { title: 'Mi espacio', robots: { index: false, follow: false } };
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireMember();
  return <DashboardShell>{children}</DashboardShell>;
}
