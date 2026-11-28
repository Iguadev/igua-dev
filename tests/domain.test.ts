import { describe, it, expect } from 'vitest';
import { safeNext, csv } from '../src/lib/utils';
import { profileSchema, projectSchema, eventSchema } from '../src/lib/validation';
import { countryOptions, isCountryCode, savedCountryCode } from '../src/lib/countries';
describe('unsafe input boundaries', () => {
  it('restores saved country names and uses assigned country codes for new selections', () => {
    expect(savedCountryCode('Costa Rica')).toBe('CR');
    expect(savedCountryCode('Brasil')).toBe('BR');
    expect(savedCountryCode('PY')).toBe('PY');
    expect(savedCountryCode('Unknown place')).toBeNull();
    expect(isCountryCode('ZZ')).toBe(false);
    expect(countryOptions('es')).toContainEqual({ value: 'DE', label: 'Alemania' });
  });
  it('keeps redirects on the same origin', () => {
    for (const path of [
      'https://attacker.test',
      '//evil.test',
      '/\\evil.test',
      'javascript:alert(1)',
      '/\n/evil.test',
      null,
    ])
      expect(safeNext(path)).toBe('/dashboard');
    expect(safeNext('/events/meetup')).toBe('/events/meetup');
  });
  it('neutralizes CSV formulas and preserves escaping', () => {
    expect(csv([['=HYPERLINK("evil")', 'hi, there', 'a"b']])).toBe(
      '\uFEFF"\'=HYPERLINK(""evil"")","hi, there","a""b"',
    );
  });
  it('rejects active URLs on projects', () => {
    expect(
      projectSchema.safeParse({
        title: 'Project',
        description: 'A sufficiently long description for a real project',
        github_url: 'javascript:alert(1)',
        demo_url: '',
        technologies: 'React',
        visibility: 'public',
      }).success,
    ).toBe(false);
  });
  it('keeps public profile consent explicit', () => {
    expect(
      profileSchema.safeParse({
        display_name: 'Ada',
        city: 'Iguazú',
        country: 'AR',
        experience: 'starting',
        bio: '',
        github_url: '',
        linkedin_url: '',
        website: '',
        interests: [],
        updates: false,
      }).success,
    ).toBe(false);
  });
  it('rejects reversed event dates', () => {
    expect(
      eventSchema.safeParse({
        title: 'Meetup',
        slug: 'meetup',
        description: 'A description for this test event',
        category: 'Software',
        starts_at: '2027-03-20T18:00:00-03:00',
        ends_at: '2027-03-20T16:00:00-03:00',
        capacity: 10,
        status: 'draft',
        registration_status: 'closed',
        venue_id: '',
        registration_opens_at: '',
        registration_closes_at: '',
        recap: '',
      }).success,
    ).toBe(false);
  });
});
