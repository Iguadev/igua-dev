import 'server-only';
import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';
import { supabaseConfig } from '@/lib/env';
import { serviceDb } from '@/lib/supabase/service';
function rateLimitSecret() {
  const secret = process.env.RATE_LIMIT_SECRET;
  return secret &&
    secret.length >= 32 &&
    process.env.SUPABASE_SECRET_KEY?.trim() &&
    supabaseConfig()
    ? secret
    : null;
}
export function rateLimitConfigured() {
  return rateLimitSecret() !== null;
}
export async function rateLimit(scope: string, identity?: string) {
  const secret = rateLimitSecret();
  if (!secret) return false;
  const h = await headers();
  // Only use Vercel's overwritten connecting-IP header in production; never trust arbitrary x-forwarded-for.
  const ip = process.env.VERCEL
    ? h.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    : 'local';
  const key = createHmac('sha256', secret)
    .update(`${scope}:${identity || ip}`)
    .digest('hex');
  try {
    const { data, error } = await serviceDb().rpc('consume_rate_limit', {
      p_key: key,
      p_limit: scope === 'login' ? 5 : 20,
      p_window: 600,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}
