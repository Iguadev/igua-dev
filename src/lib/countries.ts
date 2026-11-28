import { getAlpha2Code, getAlpha2Codes } from 'i18n-iso-countries';
import { languageTags, type Language } from '@/lib/i18n/routing';

const countryCodes = new Set(Object.keys(getAlpha2Codes()));
const languages = Object.keys(languageTags) as Language[];
const normalize = (value: string) =>
  value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function isCountryCode(value: string) {
  return countryCodes.has(value);
}

export function countryOptions(language: Language) {
  const locale = languageTags[language];
  const names = new Intl.DisplayNames(locale, { type: 'region' });
  const collator = new Intl.Collator(locale);
  return Array.from(countryCodes, (value) => ({ value, label: names.of(value) ?? value })).sort(
    (a, b) => collator.compare(a.label, b.label),
  );
}

export function savedCountryCode(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const code = value.trim().toUpperCase();
  if (isCountryCode(code)) return code;
  // Earlier versions accepted the country's name in any of the site's languages.
  const name = normalize(value);
  for (const language of languages) {
    const named = getAlpha2Code(value.trim(), language);
    if (named && isCountryCode(named)) return named;
    const localized = countryOptions(language).find((option) => normalize(option.label) === name);
    if (localized) return localized.value;
  }
  return null;
}
