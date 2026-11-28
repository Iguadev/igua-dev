'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/components/i18n/provider';
import { SearchableChoiceField, type Choice } from '@/components/ui/choice-field';

export function ProfileLocationFields({
  countries,
  savedCountry,
  savedCity,
}: {
  countries: Choice[];
  savedCountry: string | null;
  savedCity: string | null;
}) {
  const { t } = useI18n();
  const [country, setCountry] = useState(
    () => countries.find((option) => option.value === savedCountry) ?? null,
  );
  const [city, setCity] = useState<Choice | null>(() =>
    savedCountry && savedCity ? { label: savedCity, value: savedCity } : null,
  );

  return (
    <div className="form-row">
      <SearchableChoiceField
        name="country"
        label={t('País')}
        options={countries}
        value={country}
        onValueChange={(next) => {
          if (next?.value !== country?.value) setCity(null);
          setCountry(next);
        }}
        placeholder={t('Elegí un país')}
        searchLabel={t('Buscá un país')}
        emptyMessage={t('No encontramos países.')}
      />
      <CityField key={country?.value} country={country?.value} city={city} onChange={setCity} />
    </div>
  );
}

function CityField({
  country,
  city,
  onChange,
}: {
  country: string | undefined;
  city: Choice | null;
  onChange: (city: Choice | null) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ query: string; cities: string[] | null } | null>(null);
  const query = input.trim();

  useEffect(() => {
    if (!open || !country) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(
      async () => {
        try {
          const params = new URLSearchParams({ country, q: query });
          const response = await fetch(`/api/cities?${params}`, {
            credentials: 'omit',
            signal: controller.signal,
          });
          if (!response.ok) throw new Error('City lookup failed');
          const cities: string[] = await response.json();
          if (!controller.signal.aborted) setResult({ query, cities });
        } catch {
          if (!controller.signal.aborted) setResult({ query, cities: null });
        }
      },
      query ? 160 : 0,
    );
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [country, open, query]);

  const current = result?.query === query ? result : null;
  const options = (current?.cities ?? []).map((value) => ({ value, label: value }));
  const message = !current
    ? t('Buscando ciudades…')
    : current.cities
      ? t('No encontramos ciudades.')
      : t('No pudimos cargar las ciudades. Cerrá la lista y volvé a abrirla.');

  return (
    <SearchableChoiceField
      name="city"
      label={t('Ciudad')}
      options={options}
      value={city}
      onValueChange={onChange}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setInput('');
          setResult(null);
        }
      }}
      onQueryChange={setInput}
      placeholder={country ? t('Elegí una ciudad') : t('Elegí un país primero')}
      searchLabel={t('Buscá una ciudad')}
      emptyMessage={message}
      disabled={!country}
    />
  );
}
