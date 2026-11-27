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
      <p>
        {t(
          'Pollar puede crear o conectar una billetera. Después confirmás tu email para entrar a IGUA.DEV.',
        )}
      </p>
      <Button className="auth-continue" lang="en" type="button" onClick={() => setStarted(true)}>
        Continue
      </Button>
    </div>
  );
}
