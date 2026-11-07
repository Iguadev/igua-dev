'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getI18n } from '@/lib/i18n/server';
import { languagePath } from '@/lib/i18n/routing';
import { db } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/env';
import { rateLimit } from '@/lib/rate-limit';
import { safeNext } from '@/lib/utils';
import type { FormState } from '@/components/action-form';
export async function magicLink(_state: FormState, form: FormData): Promise<FormState> {
  const email = z.email().safeParse(form.get('email'));
  if (!email.success) return { message: 'Revisá tu dirección de email.' };
  const client = await db();
  if (!client) return { message: 'El registro todavía no está habilitado. Volvé pronto.' };
  if (!(await rateLimit('login')))
    return { message: 'No pudimos enviar el enlace. Intentá de nuevo más tarde.' };
  const next = safeNext(form.get('next'));
  const { error } = await client.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  return error
    ? { message: 'No pudimos enviar el enlace. Intentá de nuevo más tarde.' }
    : {
        ok: true,
        message:
          'Si el envío está disponible, vas a recibir un enlace para ingresar. Revisá tu email y la carpeta de spam.',
      };
}
export async function oauth(_state: FormState, form: FormData): Promise<FormState> {
  const provider = z.enum(['github', 'google']).safeParse(form.get('provider'));
  if (!provider.success) return { message: 'Proveedor inválido.' };
  const client = await db();
  if (!client) return { message: 'El registro todavía no está habilitado. Volvé pronto.' };
  if (!(await rateLimit('login'))) return { message: 'Intentá ingresar de nuevo más tarde.' };
  const { data, error } = await client.auth.signInWithOAuth({
    provider: provider.data,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(safeNext(form.get('next')))}`,
    },
  });
  if (error || !data.url) return { message: 'No pudimos iniciar sesión. Intentá con otro método.' };
  redirect(data.url);
}
export async function signOut(_state: FormState, _form: FormData): Promise<FormState> {
  const client = await db();
  if (client) await client.auth.signOut();
  redirect(languagePath((await getI18n()).language, '/'));
}
