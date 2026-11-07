import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import { PageIntro, ProgramCards, ClosingCTA } from '@/components/sections';
import { programs } from '@/lib/data';
const pageMetadata = {
  title: 'Programas para aprender y construir',
  description:
    'Software, open source, AI, tecnologías emergentes y emprendimientos. Explorá los programas de IGUA.DEV.',
  alternates: { canonical: '/programs' },
};
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Programs() {
  const { t, language } = await getI18n();
  const all = await programs();
  return (
    <>
      <div className="container page-content">
        <PageIntro
          label={t('Elegí tu próximo desafío')}
          title={t('Muchos caminos. Las mismas ganas de crear.')}
        >
          <p>
            {t(
              'Estos son los ejes que queremos construir con la comunidad. Los encuentros y las actividades se publicarán a medida que estén confirmados.',
            )}
          </p>
        </PageIntro>
        {all.length ? (
          <ProgramCards programs={all} />
        ) : (
          <div className="notice">
            {t('Estamos preparando los programas. Volvé pronto para conocer las propuestas.')}
          </div>
        )}
      </div>
      <ClosingCTA />
    </>
  );
}
