import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/supabase/server';
import { safeNext } from '@/lib/utils';
import { siteUrl } from '@/lib/env';
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const client = await db();
  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safeNext(request.nextUrl.searchParams.get('next')), siteUrl),
      );
  }
  return NextResponse.redirect(new URL('/login?error=callback', siteUrl));
}
