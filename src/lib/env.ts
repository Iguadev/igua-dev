import { z } from 'zod';
const publicSchema = z.object({ url: z.url(), key: z.string().min(10) });
export function supabaseConfig() {
  const result = publicSchema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!result.success) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
      throw new Error('Incomplete Supabase environment configuration');
    return null;
  }
  return result.data;
}
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
