import 'server-only';

const normalizeCity = (value: string) =>
  value
    .normalize('NFD')
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
    .toLowerCase()
    .trim();

async function loadCityIndex() {
  // City names from the GeoNames Gazetteer via cities.json (CC BY 4.0).
  const { default: cities } = await import('cities.json');
  const index = new Map<string, Map<string, string>>();
  for (const { country, name } of cities) {
    if (name.length < 2 || name.length > 100) continue;
    let countryCities = index.get(country);
    if (!countryCities) {
      countryCities = new Map();
      index.set(country, countryCities);
    }
    const key = normalizeCity(name);
    if (!countryCities.has(key)) countryCities.set(key, name);
  }
  return index;
}

let cityIndex: ReturnType<typeof loadCityIndex> | undefined;

async function citiesFor(country: string) {
  cityIndex ??= loadCityIndex();
  return (await cityIndex).get(country);
}

export async function cityName(country: string, name: string) {
  return (await citiesFor(country))?.get(normalizeCity(name));
}

export async function searchCities(country: string, query: string) {
  const cities = await citiesFor(country);
  if (!cities) return [];
  const term = normalizeCity(query);
  const exact = cities.get(term);
  const prefix: string[] = [];
  const partial: string[] = [];

  for (const [key, name] of cities) {
    if (key === term) continue;
    if (key.startsWith(term)) prefix.push(name);
    else if (key.includes(term)) partial.push(name);
  }

  const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
  return [
    ...(exact ? [exact] : []),
    ...prefix.sort(collator.compare),
    ...partial.sort(collator.compare),
  ].slice(0, 30);
}
