# IGUA.DEV

Una comunidad de tecnología desde Puerto Iguazú, Misiones, Argentina.

A local-first implementation of the supplied build brief: custom dark visual identity, Spanish (Argentina) and English public website, member area, event registration and waitlists, project moderation, partnership inquiries and administration. No fictional public activity, people, endorsements or metrics. The four program proposals are marked “En preparación”.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The app works without environment variables as an honest read-only launch preview. Registration buttons clearly explain that access is not enabled. Protected routes redirect to login. No localStorage membership, fake success messages or demo authentication.

To enable integrations, copy `.env.example` to `.env.local`, configure an **IGUA.DEV-specific** Supabase project and follow [deployment instructions](docs/DEPLOYMENT.md). Existing connected projects were not modified. Rebuild after changing public environment variables.

```sh
npm run typecheck
npm test
npm run test:concurrency
npm run build
npm start
```

`npm test` runs validation and PostgreSQL/RLS integration tests in PGlite. `test:concurrency` starts a temporary native PostgreSQL instance and opens 24 actual simultaneous sessions, with only disposable fictional test data. It requires permission to bind a loopback port. No hosted service credentials are used. Build uses the supported webpack builder because Turbopack's worker could not bind its internal port in the authoring environment; development uses Turbopack successfully.

## Languages and discoverability

Spanish uses the existing URLs; English starts at `/en`. The ES/EN switch preserves the equivalent page and filters. Interface and editorial launch copy are translated on the server. Authored community content retains its original language. See [SEO, GEO and translation maintenance](docs/SEO-GEO.md) for dictionaries, canonical/hreflang metadata, bilingual sitemap, structured data, localized social images and production indexing steps.

## Included

- All public, member and administrative routes requested in the brief, plus privacy and speaker/attendee management.
- Custom SVG wordmark, standalone brand mark, original confluence/network visual, Geist Sans/Mono, semantic colors, mobile navigation with Radix focus management, reduced motion and visible keyboard focus.
- A deferred Three.js enhancement brings the hero confluence to life with GPU-driven streams, shallow depth, pointer response and a keyboard-accessible pause control. The server-rendered SVG remains the fallback; motion stops offscreen and resources are disposed on navigation. See [design and implementation notes](docs/THREE-CONFLUENCE.md).
- Supabase SSR session refresh, GitHub/Google OAuth and email links; lightweight onboarding, opt-in public profiles, private preferences and avatar storage, account deletion requests.
- Separate event lifecycle and registration status; server/database validation; atomic capacity enforcement, idempotent registrations, cancellations and FIFO waitlist promotion; confirmation UI and durable email outbox.
- Event forms, venues, speakers, covers, recaps, attendance and safe CSV export.
- Owner-scoped project submissions/edits that return to moderation; administrator-only publication.
- Database-managed programs, event associations, partners, inquiries and selected public copy.
- Database roles, explicit RLS, server authorization, audit trails, persistent rate limits, safe error responses and private image buckets.
- Metadata, sitemap, robots, organization/event structured data, branded social image, optional Vercel Analytics and Sentry, Resend outbox worker.

## Handoff

- [Architecture and security](docs/ARCHITECTURE.md)
- [Local development and tests](docs/DEVELOPMENT.md)
- [Integration and deployment](docs/DEPLOYMENT.md)
- [Verification and remaining work](docs/VERIFICATION.md)
- [Implementation plan and regional sources](docs/PLAN.md)

The code is ready for local review. Connecting providers and validating authenticated browser journeys against a real Supabase stack remain required before public launch. This is not a claim that unconfigured third-party services are working.

## Resources library

`/recursos` contains the seven external references supplied for the community, with Spanish descriptions, topic filters, language/format labels and accent-insensitive search. Search uses a server-rendered GET form; results are shareable and work without a client-side search library. The header, mobile menu, footer and sitemap link to it.

To add or edit links, update `src/features/resources/catalog.ts`. Each entry supplies its URL, publisher, category, language, format, description and search tags. Verify the destination and update the reviewed-date copy in the route when performing a new link review. The original Anthropic blog URL currently redirects to `https://code.claude.com/docs/en/best-practices`; the catalog uses that current destination. External references are not partners or endorsements.
