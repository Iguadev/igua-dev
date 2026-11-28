'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useI18n } from '@/components/i18n/provider';
import { Button } from '@/components/ui/button';

const PollarAuthFlow = dynamic(
  () => import('./pollar-auth-flow').then((module) => module.PollarAuthFlow),
  { ssr: false, loading: PollarLoading },
);

function PollarLoading() {
  const { t } = useI18n();
  return <p role="status">{t('Un momento…')}</p>;
}

export function PollarAuth({ apiKey, next }: { apiKey: string; next: string }) {
  const { t } = useI18n();
  const [started, setStarted] = useState(false);

  if (started) return <PollarAuthFlow apiKey={apiKey} next={next} />;

  return (
    <div className="form">
      <p>{t('Ingresá con Google, GitHub, tu billetera Stellar o tu email.')}</p>
      <Button className="auth-continue" type="button" onClick={() => setStarted(true)}>
        {t('Continuar con Pollar')}
      </Button>
    </div>
  );
}
