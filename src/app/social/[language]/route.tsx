import { socialImage } from '@/lib/social-image';
export const runtime = 'nodejs';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ language: string }> },
) {
  const { language } = await params;
  if (language !== 'es' && language !== 'en') return new Response('Not found', { status: 404 });
  return socialImage(language);
}
