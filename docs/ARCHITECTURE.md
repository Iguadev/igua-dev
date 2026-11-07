# Architecture

## Runtime and module boundaries

Next.js App Router renders public editorial pages and authenticated dashboards. Server Components call `src/lib/data.ts` or per-page scoped queries. Client code is limited to Radix mobile navigation and forms using React `useActionState`; Motion only fades action feedback and respects reduced-motion preferences. The Button primitive follows shadcn/ui composition conventions with Radix Slot and CVA. Tailwind v4 provides the utility layer; shared editorial styling lives in CSS semantic tokens.

`src/features/{auth,members,events,projects,partners,admin}` owns validated Server Actions. `src/lib/supabase/server.ts` builds a request-scoped cookie client. `identity()` caches identity only for the current server render and uses server-validated `getUser()`. Proxy refreshes tokens with `getClaims()`. Guards and each action still perform their own checks; proxy is not the authorization boundary.

Most data access uses the user's publishable-key/session client with RLS. The secret-key client is server-only, limited by application convention to anonymous inquiry submission, shared rate limits and email delivery. It is never used to bypass authorization for member/admin mutations.

## Database

All public tables have RLS and explicit grants. Profiles contain no emails. Preferences, communications consent and deletion requests are in a separate owner/admin-only table. Public directory queries select only the exact opt-in fields described in privacy copy. Role rows are separate from profile inputs and can be changed only through an admin-checked function. The first admin must be bootstrapped from a trusted database console; see deployment guide.

Privileged functions live in the non-exposed `private` schema with `search_path=''`. Public RPC wrappers are SECURITY INVOKER and explicit EXECUTE grants whitelist callers. The helper role lookup is SECURITY DEFINER to avoid recursive role-table RLS; it checks `auth.uid()` and reads database-owned role rows. Trigger functions are not executable by clients. The only intentionally anonymous privileged read is event availability, which returns an aggregate for a published event and no attendee identifiers.

Projects can be saved only by their owner through `save_project`. Client-supplied ownership and publication status are ignored. An edit always returns to pending review, including edits of approved projects. Moderation requires a fresh database admin role. Only public published projects are listed on public pages. Project collaborator tables are included for future collaboration management; the initial UI supports owner editing and technology tags.

## Registration transaction

1. Verify a member exists and completed onboarding; throttle direct RPC writes.
2. Lock the `events` row with `FOR UPDATE`.
3. Check lifecycle, registration switch, time window and start time.
4. Return an existing active registration without creating another email.
5. Count confirmed registrations under the event lock; insert confirmed or waitlisted status with unique `(event_id, member_id)`.
6. Insert an email-outbox item in the same transaction.

Cancellation locks the same event first, cancels only the authenticated member's row, and promotes the earliest waitlist row by `(created_at,id)`. A cancellation on a cancelled event does not promote anyone. Capacity edits lock the event through UPDATE and a trigger forbids reducing below confirmed commitments. No direct member writes to registration rows are granted. QR check-in tokens are modeled but no incomplete scanner infrastructure is exposed.

## Emails and limits

A Vercel Cron-compatible handler claims up to 25 outbox rows using SKIP LOCKED and a five-minute lease, sends via Resend with the outbox UUID as idempotency key, then acknowledges delivery. Unsent jobs retry up to eight times. Emails contain the event title/time and a link to the current details, without interpolating untrusted HTML. Set up operational monitoring for failed delivery; exhausted jobs need manual inspection/requeue.

HMAC-hashed IP/member keys are stored in a private PostgreSQL rate-limit table. On Vercel only the platform-overwritten connecting-IP header is trusted. Elsewhere anonymous forms share a conservative local bucket; adapt trusted proxy resolution before non-Vercel hosting. Missing server credentials or rate-limit secret fail closed. Direct registration/profile/project RPC writes also have a database-level member limit.

## Media and privacy

Avatar and cover buckets are private, 2 MB maximum, with raster MIME allowlists. Server upload paths are generated or scoped to the authenticated member; byte signatures are checked. User SVG and HTML are rejected. Avatars are signed and served directly to their owner, without Next image caching. Event covers are public-content assets served via expiring signed URLs and optimized outside development. New local Supabase image URLs work without enabling global local-IP image fetching.

Audit triggers retain action identifiers and statuses, not full records or email addresses. Sensitive role, content, partner and event changes are logged. Account deletion is an explicit request workflow: public visibility turns off immediately; an administrator still needs to delete files, revoke sessions and remove the auth account. This manual obligation is visible in settings, not disguised as instant deletion.

## Expansion boundaries

No microservices, fake social channels, public external affiliations, QR scanner, auto-broadcast newsletter, payment tier or provider provisioning is added. Programs and selected editorial content are database managed. The UI/formatter conventions isolate Spanish copy for future translation, but Portuguese/English translations are not shipped. Complete collaborator management, project cover upload, external event resources UI and partner logo uploads can extend the modeled fields when needed; current public pages intentionally use approved text rather than invented imagery.
