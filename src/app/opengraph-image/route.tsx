import { socialImage } from '@/lib/social-image';
import { getI18n } from '@/lib/i18n/server';
export const runtime = 'nodejs';
export async function GET() {
  const { language } = await getI18n();
  return socialImage(language);
}
