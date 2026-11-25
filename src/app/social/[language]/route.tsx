import { socialImage } from '@/lib/social-image';
import { isLanguage } from '@/lib/i18n/routing';
export const runtime = 'nodejs';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ language: string }> },
) {
  const { language } = await params;
  if (!isLanguage(language)) return new Response('Not found', { status: 404 });
  return socialImage(language);
}
