import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/supabase/server';
import { safeNext } from '@/lib/utils';
import { siteUrl } from '@/lib/env';
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  const client = await db();
  if (token_hash && type === 'email' && client) {
    const { error } = await client.auth.verifyOtp({ token_hash, type: 'email' });
    if (!error)
      return NextResponse.redirect(
        new URL(safeNext(request.nextUrl.searchParams.get('next')), siteUrl),
      );
  }
  return NextResponse.redirect(new URL('/login?error=confirmation', siteUrl));
}
