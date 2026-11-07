import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseConfig } from '@/lib/env';
export async function db() {
  const config = supabaseConfig();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
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
}
