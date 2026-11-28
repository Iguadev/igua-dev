import { expect, it, vi } from 'vitest';
import { publicMembers } from '../src/features/members/directory';

const { query } = vi.hoisted(() => ({
  query: {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    overrideTypes: vi.fn(),
  },
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase/server', () => ({ db: async () => ({ from: () => query }) }));

it('loads only opted-in, completed profiles and publishes each public project link once', async () => {
  const published = { slug: 'fixture-project', title: 'Fixture project', created_at: '2026-01-01' };
  query.overrideTypes.mockResolvedValue({
    error: null,
    data: [
      {
        id: 'fixture-id',
        display_name: 'Fixture member',
        city: 'Iguazú',
        bio: '',
        github_url: null,
        country: 'private field',
        owned: [published],
        collaborations: [{ project: published }],
      },
    ],
  });

  const { members } = await publicMembers(1);
  expect(query.eq).toHaveBeenCalledWith('public_profile', true);
  expect(query.eq).toHaveBeenCalledWith('onboarded', true);
  expect(query.eq).toHaveBeenCalledWith('owned.visibility', 'public');
  expect(query.eq).toHaveBeenCalledWith('owned.status', 'published');
  expect(query.eq).toHaveBeenCalledWith('collaborations.project.visibility', 'public');
  expect(query.eq).toHaveBeenCalledWith('collaborations.project.status', 'published');
  expect(members).toMatchObject([{ projects: [{ slug: published.slug, title: published.title }] }]);
  expect(members[0]).not.toHaveProperty('country');
});
