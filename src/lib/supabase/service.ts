import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/env';
export function serviceDb() {
  const config = supabaseConfig();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!config || !key) throw new Error('Server integration unavailable');
  return createClient(config.url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
