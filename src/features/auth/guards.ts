import 'server-only';
import { cache } from 'react';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/supabase/server';
import { getI18n } from '@/lib/i18n/server';
import { languagePath } from '@/lib/i18n/routing';
export const signedInUser = cache(async () => {
  const client = await db();
  if (!client) return null;
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  return error ? null : user;
});
export const identity = cache(async () => {
  const [client, user] = await Promise.all([db(), signedInUser()]);
  if (!client || !user) return null;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    client.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    client.from('member_roles').select('role').eq('member_id', user.id),
  ]);
  return { client, user, profile, roles: (roles ?? []).map((r) => r.role as string) };
});
export async function requireMember() {
  const member = await identity();
  if (!member) {
    const { language } = await getI18n();
    redirect(languagePath(language, '/login'));
  }
  return member;
}
export async function requireStaff(adminOnly = false) {
  const member = await requireMember();
  if (
    !member.roles.some((role) =>
      adminOnly ? role === 'admin' : ['organizer', 'admin'].includes(role),
    )
  )
    notFound();
  return member;
}
