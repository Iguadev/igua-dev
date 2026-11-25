# Connect and deploy

The user's current instruction is **local-only; connect services later**. No hosted Supabase or Vercel resource was created or modified.

## Supabase

1. Select or create a dedicated IGUA.DEV project. Confirm organization, region, plan and ownership first; do not reuse an unrelated connected project.
2. Check installed CLI help, link the intended project and inspect existing tables/migrations before applying the supplied migration. Start with a fresh staging project. Apply migrations using the supported CLI/MCP migration workflow, then run Supabase database security/performance advisors.
3. Keep `private` out of exposed Data API schemas. The migration explicitly grants required table/function access with RLS. Check a published event, owner profile, non-owner project, organizer and administrator using real sessions.
4. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, server-only `SUPABASE_SECRET_KEY`, `RATE_LIMIT_SECRET` (32+ random characters), and `NEXT_PUBLIC_SITE_URL=https://www.iguazu.dev` in Production. Preview deployments can omit it (they use `VERCEL_URL`). Do not prefix server secrets with NEXT_PUBLIC_. Rebuild after changing public values.
5. Enable GitHub/Google providers with their app credentials in Supabase. Register the Supabase callback URL with each provider. Allow only exact local/staging/production application callbacks in Supabase redirect configuration. Avoid broad production wildcard allowlists.
6. Set custom SMTP in Supabase for production magic links. For PKCE email confirmation use a template link such as `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`. OAuth returns to `/auth/callback`; both flows verify server-side.
7. Bootstrap the first administrator in a trusted SQL console after authenticating that person and verifying their auth user UUID:

```sql
-- Replace the literal only after verifying the intended IGUA.DEV user.
insert into public.member_roles(member_id,role)
values ('<verified-auth-user-uuid>'::uuid,'admin')
on conflict(member_id,role) do nothing;
```

Self-assignment through onboarding is deliberately impossible. The admin UI forbids demoting your own admin account.

## Resend / email processing

Verify an owned sending domain in Resend. Configure `RESEND_API_KEY`, `RESEND_FROM` and a random `CRON_SECRET`. The cron endpoint requires `Authorization: Bearer <CRON_SECRET>` and never accepts unauthenticated calls. `vercel.json` requests a ten-minute schedule; select a hosting plan that supports that frequency, or use a scheduler with the same secret. Registration commits even if delivery is delayed because the email is durably queued in the registration transaction. The UI shows confirmed/waitlisted status immediately.

Inspect failed jobs with an authorized database console, never a browser/public client:

```sql
select id,kind,attempts,created_at from private.email_outbox
where sent_at is null and attempts >= 8;
```

Investigate delivery configuration before resetting `attempts` and `lease_until` for specific IDs. Alert on backlog/exhausted attempts. There is no claim of automatic notification delivery before Resend and the scheduler are connected.

## Vercel / observability

The public origin is **https://www.iguazu.dev**. Point both `iguazu.dev` and `www.iguazu.dev` at the Vercel project; the app 308s the apex host to `www`. Import the repository as a Next.js project and use `npm ci`, `npm run build`. Choose a supported Node runtime >=22.12 (prefer current LTS). Set `NEXT_PUBLIC_SITE_URL=https://www.iguazu.dev` on Production so Open Graph and auth redirects match. Sitemap and robots already hard-code that origin. After deploy, submit `https://www.iguazu.dev/sitemap.xml` in Search Console. Add remaining environment variables separately for preview and production, with distinct Supabase projects where practical. Do not expose production credentials in preview builds.

Set Sentry DSN and optional build token/org/project to enable instrumentation and sourcemaps. Sentry 11 uses `@sentry/nextjs/config` and granular `dataCollection`; this app disables collection of users, cookies, headers, bodies, query strings, database payloads and stack variables. Vercel Analytics activates only on Vercel. Verify actual monitoring events and ensure sensitive data is scrubbed before enabling production traffic.

## Before opening registration

- Publish verified organizer identity and a contact channel in privacy/community pages; review the privacy text for the actual operating entity and retention process.
- Complete real GitHub, Google and magic-link sign-in, refresh, sign-out and invalid-link journeys on desktop/mobile.
- Test new member onboarding, opt-in directory visibility, private preferences, avatar upload, project ownership/moderation and member/admin route boundaries through the real Data API.
- Exercise a published event from creation through registration, waitlist, cancellation, promotion, email, attendee export and attendance.
- Run Supabase advisors and confirm no public write grants or unexpected schema exposure.
- Verify domain, HTTPS, canonical URL, OG image, sitemap, final copy, keyboard flows and contrast. Measure Core Web Vitals against deployed content; no score is promised by local visual review.
- Establish backups, logs, delivery alerts and a person responsible for deletion requests.

## Deletion operations

The settings screen records an account deletion request and immediately hides the public profile. An admin sees requests in member management. Verify the requester, remove their Storage files with server-authorized tools, revoke sessions/sign out, then delete their auth account. Cascades remove profile-owned records; audit actor identifiers become null. Deleting auth alone does not invalidate issued access tokens instantly, so use short expiry and revoke active sessions. Confirm deletion with the member through the verified channel. This is intentionally a manual workflow until operational requirements are agreed.
