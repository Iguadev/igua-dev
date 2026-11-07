# Local development

## Read-only preview

`npm ci && npm run dev` works with no secrets. Use http://localhost:3000. Empty content is intentional, not mock data. `NEXT_PUBLIC_SITE_URL` defaults to that origin.

## Local Supabase

Install Docker Desktop separately if you want the full local Supabase stack. Docker was not available in the authoring environment. Supabase CLI is pinned in devDependencies. Version 3 defaults to local targets and changed some v2 commands, so check help before running a workflow:

```sh
npx supabase --help
npx supabase start --help
npx supabase start
npx supabase status
npx supabase db --help
npx supabase db reset --help
```

Use the CLI's local reset workflow only on a disposable local stack; it recreates local data and applies migrations. A production dataset must never be used for local tests. Set the local URL and publishable key from status in `.env.local`. Configure a local secret key for rate-limit RPCs, `RATE_LIMIT_SECRET` with at least 32 random characters, and the site origin. Leave Resend absent to avoid sending real email; local auth mail is available in the Supabase mail testing UI.

`supabase/seed.sql` deliberately adds no fictional activity. The migration supplies only proposed program copy and technical interests. Automated tests create clearly fictional fixture identities/events inside disposable databases; these are never imported by application runtime or deployment.

## Verification commands

- `npm run typecheck`: strict TypeScript.
- `npm test`: schemas, redirect safety, CSV injection, plus the real migration applied to PGlite with lightweight mocks of Supabase-managed auth/storage schemas. Exercises PostgreSQL policies and functions, not an imitation of application logic.
- `npm run test:concurrency`: independent native PostgreSQL, real multi-session row-lock contention. Uses a temporary directory and loopback port 55439; cleans its database on shutdown. Does not need Docker or hosted credentials.
- `npm run build`: production build with webpack.
- `node scripts/check-launch.mjs`: HTTP contract checks against the running unconfigured preview.
- `npm run test:e2e`: authored Playwright launch tests for desktop and phone. Install browsers first (`npx playwright install`); the authoring session used its supported browser tool for UI checks rather than this runner.

Never describe PGlite's queued calls as proof of real concurrent transactions. The separate native test exists for that reason. Never describe the launch E2E suite as an authenticated integration test. Real OAuth, SMTP, storage and signed-in member/admin journeys need a configured Supabase environment.

## Editing

Use `npm run format` for Prettier. Preserve the generated Next.js agent guide block in AGENTS.md. Do not remove boundaries just to silence a type or RLS error. Add behavior-level tests when changing permissions, state transitions or seat allocation.
