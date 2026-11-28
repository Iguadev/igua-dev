'use server';

import { createHash } from 'node:crypto';
import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod';
import type { FormState } from '@/components/action-form';
import { memberDestination } from '@/features/auth/destination';
import { pollarPublishableKey, pollarSessionUrl, siteUrl } from '@/lib/env';
import { languagePath } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import { rateLimit } from '@/lib/rate-limit';
import { db } from '@/lib/supabase/server';
import { serviceDb } from '@/lib/supabase/service';

const credentials = z.object({
  accessToken: z
    .string()
    .min(1)
    .max(8192)
    .regex(/^[\x21-\x7e]+$/),
  proof: z
    .string()
    .min(1)
    .max(4096)
    .regex(/^[\w.-]+$/),
});
const providerId = z.union([z.string().trim().min(1).max(256), z.number().int().nonnegative()]);
const pollarSession = z.object({
  success: z.literal(true),
  code: z.literal('SDK_SESSION_RESUMED'),
  content: z.object({
    providers: z.object({
      email: z.object({ address: z.string().nullish() }).nullish(),
      google: z.object({ id: providerId.nullish() }).nullish(),
      github: z.object({ id: providerId.nullish() }).nullish(),
      wallet: z.object({ address: z.string().nullish() }).nullish(),
    }),
  }),
});
const accountSchema = z.object({
  account_id: z.uuid(),
  email: z.email(),
  user_id: z.uuid().nullable(),
});
type PollarSignInResult =
  | { status: 'error' | 'account-conflict' }
  | { status: 'nonce'; nonce: string; clockOffsetSec: number };

export async function signInWithPollar(input: unknown, next: unknown): Promise<PollarSignInResult> {
  const auth = credentials.safeParse(input);
  const apiKey = pollarPublishableKey();
  if (!auth.success || !apiKey || !(await rateLimit('pollar-login'))) return { status: 'error' };

  let onboarded = false;
  try {
    const res = await fetch(pollarSessionUrl, {
      headers: {
        Authorization: `DPoP ${auth.data.accessToken}`,
        DPoP: auth.data.proof,
        // Pollar validates the registered origin for publishable-key requests.
        Origin: siteUrl,
        'x-pollar-api-key': apiKey,
      },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });
    const nonce = res.headers.get('DPoP-Nonce');
    if (res.status === 401 && nonce && nonce.length <= 4096) {
      const offset = (Date.parse(res.headers.get('date') ?? '') - Date.now()) / 1000;
      const clockOffsetSec = Number.isFinite(offset) && Math.abs(offset) <= 86400 ? offset : 0;
      return { status: 'nonce', nonce, clockOffsetSec };
    }
    if (!res.ok) return { status: 'error' };
    const session = pollarSession.safeParse(await res.json());
    if (!session.success) return { status: 'error' };

    // Use only provider identifiers vouched for by Pollar's authenticated response.
    // The profile's display email is deliberately not an account identifier.
    const { providers } = session.data.content;
    const email = z.email().max(254).safeParse(providers.email?.address?.trim().toLowerCase());
    const wallet = z
      .string()
      .regex(/^[GC][A-Z2-7]{55}$/)
      .safeParse(providers.wallet?.address);
    const identifiers = [
      ['email', email.data],
      ['google', providers.google?.id],
      ['github', providers.github?.id],
      ['stellar', wallet.data],
    ] as const;
    const keys = identifiers.flatMap(([provider, id]) =>
      id == null ? [] : [createHash('sha256').update(`pollar:${provider}:${id}`).digest('hex')],
    );
    if (!keys.length) return { status: 'error' };

    const client = await db();
    if (!client) return { status: 'error' };
    const service = serviceDb();
    const resolved = await service
      .rpc('resolve_pollar_account', {
        p_keys: keys,
        p_verified_email: email.data ?? null,
      })
      .single();
    if (resolved.error?.message === 'POLLAR_ACCOUNT_CONFLICT')
      return { status: 'account-conflict' };
    const account = accountSchema.safeParse(resolved.data);
    if (resolved.error || !account.success || !(await rateLimit('login', account.data.account_id)))
      return { status: 'error' };

    // Redeem a Supabase session credential entirely on the server. No email is sent.
    let signedIn = false;
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, error } = await service.auth.admin.generateLink({
        type: 'magiclink',
        email: account.data.email,
      });
      if (error?.code === 'email_exists' || error?.code === 'user_already_exists') continue;
      if (error || !data.properties?.hashed_token || !data.user) return { status: 'error' };
      if (account.data.user_id && data.user.id !== account.data.user_id) return { status: 'error' };

      const { error: bindError } = await service.rpc('bind_pollar_account', {
        p_account_id: account.data.account_id,
        p_user_id: data.user.id,
      });
      if (bindError) return { status: 'error' };
      const verified = await client.auth.verifyOtp({
        token_hash: data.properties.hashed_token,
        type: 'email',
      });
      if (verified.error?.code === 'otp_expired') continue;
      if (verified.error || !verified.data.session) return { status: 'error' };
      const profile = await client
        .from('profiles')
        .select('onboarded')
        .eq('id', data.user.id)
        .single();
      onboarded = profile.data?.onboarded === true;
      signedIn = true;
      break;
    }
    if (!signedIn) return { status: 'error' };
  } catch {
    return { status: 'error' };
  }
  redirect(memberDestination((await getI18n()).language, next, onboarded), RedirectType.replace);
}

export async function signOut(_state: FormState, _form: FormData): Promise<FormState> {
  const client = await db();
  if (client) await client.auth.signOut({ scope: 'local' });
  redirect(languagePath((await getI18n()).language, '/'));
}
