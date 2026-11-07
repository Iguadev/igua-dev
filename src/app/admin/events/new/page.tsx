import { getI18n } from '@/lib/i18n/server';
import { requireStaff } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { EventForm } from '@/components/event-form';
export default async function NewEvent() {
  const { t, language } = await getI18n();
  const member = await requireStaff();
  const { data, error } = await member.client.from('venues').select('id,name');
  if (error) throw new Error('Could not load venues');
  return (
    <>
      <PageIntro label={t('Un nuevo punto de encuentro')} title={t('Crear evento.')} />
      <EventForm venues={data} />
    </>
  );
}
