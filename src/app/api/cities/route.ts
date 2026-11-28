import { searchCities } from '@/lib/cities';
import { isCountryCode } from '@/lib/countries';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const country = params.get('country') ?? '';
  const query = params.get('q') ?? '';
  if (!isCountryCode(country) || query.length > 100)
    return Response.json({ error: 'Invalid city search' }, { status: 400 });

  return Response.json(await searchCities(country, query), {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
