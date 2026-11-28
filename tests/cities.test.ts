import { describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/cities/route';
import { cityName } from '@/lib/cities';

vi.mock('server-only', () => ({}));

const lookup = (country: string, q: string) =>
  GET(new Request(`http://localhost/api/cities?${new URLSearchParams({ country, q })}`));

describe('profile city catalog', () => {
  it('finds cities with or without accents in the selected country', async () => {
    const argentina = await lookup('AR', 'puerto iguazu');
    expect(await argentina.json()).toEqual(['Puerto Iguazú']);
    expect(await (await lookup('BR', 'puerto iguazu')).json()).toEqual([]);
    expect(await (await lookup('BR', 'foz do iguacu')).json()).toEqual(['Foz do Iguaçu']);
  });

  it('resolves a saved city name only within its country', async () => {
    expect(await cityName('CR', 'San Jose')).toBe('San José');
    expect(await cityName('PY', 'Ciudad del Este')).toBe('Ciudad del Este');
    expect(await cityName('CR', 'Ciudad del Este')).toBeUndefined();
  });

  it('bounds results and rejects invalid country codes or oversized queries', async () => {
    expect(await (await lookup('US', '')).json()).toHaveLength(30);
    expect((await lookup('ZZ', 'city')).status).toBe(400);
    expect((await lookup('US', 'x'.repeat(101))).status).toBe(400);
  });
});
