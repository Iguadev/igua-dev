'use client';

import { useI18n } from '@/components/i18n/provider';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { t, language } = useI18n();
  return (
    <div className="container page-content">
      <div className="page-intro">
        <h1>{t('No pudimos cargar este espacio.')}</h1>
        <p>{t('Revisá tu conexión e intentá de nuevo en un momento.')}</p>
      </div>
      <Button onClick={reset}>{t('Volver a intentar')}</Button>
    </div>
  );
}
