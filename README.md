# IGUA.DEV

Una comunidad de tecnología desde Puerto Iguazú, Misiones, Argentina.

The public website is available in Argentine Spanish, Brazilian Portuguese and English. This local-first project includes a custom dark visual identity, a member area, event registration and waitlists, project moderation, partnership inquiries and administration. No fictional public activity, people, endorsements or metrics. The four program proposals are marked “En preparación”.

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

Spanish pages use unprefixed URLs, Brazilian Portuguese pages start at `/pt`, and English pages start at `/en`. The language switch keeps the current page, filters and fragment. Community-authored content retains its original language. The multilingual sitemap, translation dictionaries, page metadata and social images are documented in [SEO, GEO and translation maintenance](docs/SEO-GEO.md).

## Included

- All public, member and administrative routes requested in the brief, plus privacy and speaker/attendee management.
- Custom SVG wordmark and symbol, responsive footage of Iguazú Falls, and an illustrated map of the Triple Frontier. Mobile navigation supports keyboard focus, Escape and reduced motion.
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

`/recursos`, `/pt/recursos` and `/en/recursos` share the same seven external references, with localized descriptions, topic filters, language/format labels and accent-insensitive search. Search uses a server-rendered GET form; results are shareable and work without a client-side search library. The header, mobile menu, footer and sitemap link to it.

To add or edit links, update `src/features/resources/catalog.ts`. Each entry supplies its URL, publisher, category, language, format, description and search tags. Verify the destination and update the reviewed-date copy in the route when performing a new link review. The original Anthropic blog URL currently redirects to `https://code.claude.com/docs/en/best-practices`; the catalog uses that current destination. External references are not partners or endorsements.
