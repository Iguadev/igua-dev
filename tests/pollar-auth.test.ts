import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signInWithPollar } from '@/features/auth/actions';
import { memberDestination } from '@/features/auth/destination';
import { siteUrl } from '@/lib/env';

const { generateLink, verifyOtp, redirect, rateLimit, rpc, profile } = vi.hoisted(() => ({
  generateLink: vi.fn(),
  verifyOtp: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`Redirected to ${path}`);
  }),
  rateLimit: vi.fn(),
  rpc: vi.fn(),
  profile: vi.fn(),
}));

vi.mock('next/navigation', () => ({ redirect, RedirectType: { replace: 'replace' } }));
vi.mock('@/lib/i18n/server', () => ({ getI18n: async () => ({ language: 'en' }) }));
vi.mock('@/lib/rate-limit', () => ({ rateLimit }));
vi.mock('@/lib/supabase/server', () => ({
  db: async () => ({
    auth: { verifyOtp },
    from: () => ({ select: () => ({ eq: () => ({ single: profile }) }) }),
  }),
}));
vi.mock('@/lib/supabase/service', () => ({
  serviceDb: () => ({ auth: { admin: { generateLink } }, rpc }),
}));

const credentials = { accessToken: 'pollar-token', proof: 'pollar.dpop.proof' };
const email = 'member@example.com';
const alias = 'internal-only@pollar.invalid';
const accountId = '11111111-1111-4111-8111-111111111111';
const userId = '22222222-2222-4222-8222-222222222222';
const stellarAddress = `G${'A'.repeat(55)}`;
const pollarFetch = vi.fn();

function pollarProfile(providers: Record<string, unknown>) {
  return Response.json({
    success: true,
    code: 'SDK_SESSION_RESUMED',
    content: { mail: email, providers },
  });
}

function resolveAs(loginEmail: string, onboarded = false) {
  rpc.mockImplementation((method: string) =>
    method === 'resolve_pollar_account'
      ? {
          single: async () => ({
            data: { account_id: accountId, email: loginEmail, user_id: userId },
          }),
        }
      : Promise.resolve({ error: null }),
  );
  profile.mockResolvedValue({ data: { onboarded } });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY', 'pub_testnet_example');
  vi.stubGlobal('fetch', pollarFetch);
  rateLimit.mockResolvedValue(true);
  generateLink.mockResolvedValue({
    data: { properties: { hashed_token: 'internal-token' }, user: { id: userId } },
  });
  verifyOtp.mockResolvedValue({ data: { session: {} }, error: null });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('Pollar session exchange', () => {
  it.each([
    { providers: { google: { id: 'g-id' } }, identity: 'google:g-id', verifiedEmail: null },
    { providers: { github: { id: 12345 } }, identity: 'github:12345', verifiedEmail: null },
    {
      providers: { wallet: { address: stellarAddress } },
      identity: `stellar:${stellarAddress}`,
      verifiedEmail: null,
    },
    { providers: { email: { address: email } }, identity: `email:${email}`, verifiedEmail: email },
  ])(
    'opens a session and starts profile setup after $identity',
    async ({ providers, identity, verifiedEmail }) => {
      pollarFetch.mockResolvedValue(pollarProfile(providers));
      resolveAs(verifiedEmail ?? alias);

      await expect(signInWithPollar(credentials, '/en/dashboard')).rejects.toThrow(
        'Redirected to /en/dashboard/profile',
      );
      expect(pollarFetch).toHaveBeenCalledWith(
        'https://sdk.api.pollar.xyz/v3/auth/session/resume',
        expect.objectContaining({
          headers: {
            Authorization: 'DPoP pollar-token',
            DPoP: 'pollar.dpop.proof',
            Origin: siteUrl,
            'x-pollar-api-key': 'pub_testnet_example',
          },
        }),
      );
      expect(rpc).toHaveBeenCalledWith('resolve_pollar_account', {
        p_keys: [createHash('sha256').update(`pollar:${identity}`).digest('hex')],
        p_verified_email: verifiedEmail,
      });
      expect(generateLink).toHaveBeenCalledWith({
        type: 'magiclink',
        email: verifiedEmail ?? alias,
      });
      expect(rpc).toHaveBeenCalledWith('bind_pollar_account', {
        p_account_id: accountId,
        p_user_id: userId,
      });
      expect(verifyOtp).toHaveBeenCalledWith({ token_hash: 'internal-token', type: 'email' });
    },
  );

  it('returns a member with a completed profile to the original localized destination', async () => {
    pollarFetch.mockResolvedValue(pollarProfile({ google: { id: 'g-id' } }));
    resolveAs(alias, true);
    await expect(signInWithPollar(credentials, '/dashboard/events')).rejects.toThrow(
      'Redirected to /en/dashboard/events',
    );
  });

  it.each([401, 403])(
    'does not issue an app session when Pollar rejects credentials (%s)',
    async (status) => {
      pollarFetch.mockResolvedValue(new Response(null, { status }));
      await expect(signInWithPollar(credentials, '/en/dashboard')).resolves.toEqual({
        status: 'error',
      });
      expect(rpc).not.toHaveBeenCalled();
      expect(generateLink).not.toHaveBeenCalled();
    },
  );

  it('retries a replaced Supabase exchange token without exposing or sending it', async () => {
    pollarFetch.mockResolvedValue(pollarProfile({ google: { id: 'g-id' } }));
    resolveAs(alias);
    verifyOtp.mockResolvedValueOnce({ error: { code: 'otp_expired' } });
    await expect(signInWithPollar(credentials, '/en/dashboard')).rejects.toThrow(
      'Redirected to /en/dashboard/profile',
    );
    expect(verifyOtp).toHaveBeenCalledTimes(2);
  });

  it('will not sign in if the configured auth account was replaced', async () => {
    pollarFetch.mockResolvedValue(pollarProfile({ google: { id: 'g-id' } }));
    resolveAs(alias);
    generateLink.mockResolvedValue({
      data: { properties: { hashed_token: 'other-token' }, user: { id: accountId } },
    });
    await expect(signInWithPollar(credentials, '/en/dashboard')).resolves.toEqual({
      status: 'error',
    });
    expect(verifyOtp).not.toHaveBeenCalled();
  });
});

describe('member destination', () => {
  it('keeps the original destination through localized profile setup', () => {
    expect(memberDestination('pt', '/dashboard/events?view=past', false)).toBe(
      '/pt/dashboard/profile?next=%2Fpt%2Fdashboard%2Fevents%3Fview%3Dpast',
    );
    expect(memberDestination('pt', '/en/dashboard/events?view=past', true)).toBe(
      '/pt/dashboard/events?view=past',
    );
    expect(memberDestination('en', '/join', true)).toBe('/en/dashboard');
    expect(memberDestination('es', '/something/..//other.example', true)).toBe('/dashboard');
  });
});
