import 'server-only';
import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sessionCookies, supabaseConfig } from '@/lib/env';
export const db = cache(async function db() {
  const config = supabaseConfig();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    cookieOptions: sessionCookies,
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (items) => {
        try {
          for (const { name, value, options } of items) jar.set(name, value, options);
        } catch {
          /* Server Components rely on proxy for refresh. */
        }
      },
    },
  });
});
