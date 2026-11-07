import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseConfig } from '@/lib/env';
import { languagePath, stripLanguage } from '@/lib/i18n/routing';
export async function proxy(request: NextRequest) {
  const language =
    request.nextUrl.pathname === '/en' || request.nextUrl.pathname.startsWith('/en/') ? 'en' : 'es';
  const pathname = stripLanguage(request.nextUrl.pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-igua-language', language);
  requestHeaders.set('x-igua-path', pathname);
  requestHeaders.set(
    'x-igua-filtered',
    request.nextUrl.searchParams.has('q') || request.nextUrl.searchParams.has('tema')
      ? 'true'
      : 'false',
  );
  const destination = request.nextUrl.clone();
  destination.pathname = pathname;
  const nextResponse = () =>
    language === 'en'
      ? NextResponse.rewrite(destination, { request: { headers: requestHeaders } })
      : NextResponse.next({ request: { headers: requestHeaders } });
  const config = supabaseConfig();
  const protectedPath = /^\/(dashboard|admin)(?:\/|$)/.test(pathname);
  if (!config)
    return protectedPath
      ? NextResponse.redirect(new URL(languagePath(language, '/login'), request.url))
      : nextResponse();
  let response = nextResponse();
  const client = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items, headers) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        requestHeaders.set('cookie', request.headers.get('cookie') || '');
        response = nextResponse();
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        if (headers)
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  const { data, error } = await client.auth.getClaims();
  if (protectedPath && (error || !data?.claims)) {
    const redirect = NextResponse.redirect(new URL(languagePath(language, '/login'), request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set('Cache-Control', 'private, no-store');
    return redirect;
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = {
  matcher: [
    '/((?!_next|api(?:/|$)|auth(?:/|$)|brand(?:/|$)|social(?:/|$)|robots\\.txt|sitemap\\.xml|llms\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2|ico)$).*)',
  ],
};
