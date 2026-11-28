import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
export const dynamic = 'force-dynamic';
import { requireMember } from '@/features/auth/guards';
import { DashboardShell } from '@/components/dashboard-shell';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { memberDestination } from '@/features/auth/destination';
const pageMetadata = { title: 'Mi espacio', robots: { index: false, follow: false } };
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Layout({ children }: { children: React.ReactNode }) {
  const member = await requireMember();
  if (!member.profile?.onboarded) {
    const [h, { language }] = await Promise.all([headers(), getI18n()]);
    const path = h.get('x-igua-path');
    if (path !== '/dashboard/profile') redirect(memberDestination(language, path, false));
    return <div className="container profile-setup">{children}</div>;
  }
  return <DashboardShell>{children}</DashboardShell>;
}
