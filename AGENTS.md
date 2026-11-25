<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# IGUA.DEV — agent brief

Independent technology community site for Puerto Iguazú, Misiones, Argentina. Public product language is Argentine Spanish (voseo, accents, tagline **El futuro también se construye desde acá.**). Brazilian Portuguese lives under `/pt`, English under `/en`. The app is a Next.js 16 App Router + React 19 + strict TypeScript codebase with Supabase/PostgreSQL.

Human overview: `README.md`. Architecture, deploy, i18n/SEO, and verification live in `docs/`.

## Non-negotiables

- Never invent people, events, partners, projects, testimonials, contact channels, addresses, or statistics for production UI, metadata, JSON-LD, or `llms.txt`. Honest empty states and closed integrations stay honest.
- Every Server Action authenticates and authorizes itself. RLS is a second boundary. Roles come from `member_roles` in the database, never `user_metadata` or client-supplied fields.
- Elevated SQL stays in schema `private` with empty `search_path`, explicit grants, and public `SECURITY INVOKER` wrappers. Registration and cancellation lock the **event row** (`FOR UPDATE`) before counting or changing seats. Waitlist promotion is FIFO on `(created_at, id)`.
- Local-only is the current operating instruction: do not create, link, migrate, or mutate an unrelated hosted Supabase/Vercel project.
- Secrets stay in environment config. Never commit `.env`, never put server keys in client code (`NEXT_PUBLIC_*` is public).
- Spanish source strings are the i18n keys. When you add `t('...')` or `localizeMetadata` copy, add the same key to `src/lib/i18n/{en,pt}.json` and, for client components, `{en,pt}-ui.json`.
- New migrations: `npx supabase migration new <name>` after checking CLI v3 help. Apply the SQL to real PostgreSQL (PGlite suite and/or local stack); do not hand-edit production.

## Product map

Public routes (each also at `/pt…` and `/en…` via rewrite): `/`, `/about`, `/events`, `/events/[slug]`, `/programs`, `/projects`, `/projects/[slug]`, `/community`, `/reglamento`, `/recursos`, `/partners`, `/join`, `/privacy`.

Authenticated: `/dashboard/*` (member), `/admin/*` (organizer/admin). `/login`, `/auth/callback`, `/auth/confirm` are unlisted.

Discovery: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/llms.txt/route.ts`, `src/app/social/[language]/route.tsx`, JSON-LD helpers in `src/lib/seo.ts`.

## Layout of the repo

```
src/app/                 App Router pages and metadata routes
src/features/*/actions.ts  Domain mutations (auth, members, events, projects, partners, admin)
src/features/auth/guards.ts  identity() / requireMember / requireStaff (React.cache)
src/features/resources/catalog.ts  Curated external library (not partnerships)
src/lib/data.ts          Cached public reads
src/lib/seo.ts           Metadata + schema.org builders
src/lib/i18n/            Dictionaries and URL language helpers
src/lib/supabase/        Request-scoped SSR client (`db` is React.cache)
src/proxy.ts             Language headers, session refresh, optimistic auth redirects
supabase/                Migrations; seed.sql must not invent community activity
tests/                   Vitest (schemas + PGlite RLS) and concurrency helper
```

`src/proxy.ts` is not the authorization boundary. Guards and actions still check. Proxy sets `x-igua-language`, `x-igua-path`, and `x-igua-filtered` (search `q`/`tema` → noindex).

## Runtime conventions

- Prefer Server Components. Client components: mobile nav, `useActionState` forms, language switch, reduced-motion-aware Motion.
- Deduplicate per-request I/O with `React.cache()` (`db`, `identity`, `getI18n`, public loaders, slug lookups). Independent awaits go in `Promise.all`.
- Import modules directly; do not grow barrel files. Keep payloads across the RSC boundary small.
- Secret-key Supabase client is server-only: anonymous inquiries, shared rate limits, email outbox. Never use it to skip member/admin authorization.
- The first admin is bootstrapped from a trusted SQL console. Onboarding cannot self-assign admin.

## Copy, SEO, AEO

- Visible answers on `/about` must stay in sync with `faqEntities`. FAQ JSON-LD `@id` is `#faq`, never `#webpage`.
- Organization schema: location in Puerto Iguazú only. No telephone, email, `sameAs`, employee counts, or founding dates unless they exist in product copy.
- Event JSON-LD: `EventCancelled` / `EventCompleted` / `EventScheduled`. Set `eventAttendanceMode` to offline only when a venue exists. Events are free (`isAccessibleForFree`).
- Do not index `/login`, `/dashboard`, `/admin`, `/api`, `/auth`, or filtered resource views.
- Canonical production origin is `https://www.iguazu.dev` (`src/lib/env.ts`). Apex `iguazu.dev` 308s to `www`. Never submit localhost to search consoles.
- `/llms.txt` is supplementary documentation for language models, not a ranking hack. Keep it factual and linked to public pages.

## Verification

Nontrivial change: `npm run typecheck`, `npm test`, `npm run build`. Registration/locking: also `npm run test:concurrency`. i18n/HTTP contracts: running preview + `node scripts/check-i18n.mjs` and `node scripts/check-launch.mjs`. E2E: `docs/VERIFICATION.md` before claiming coverage; Playwright is launch-preview, not authenticated integration.

Node `>=22.12`. `npm run build` uses webpack by project choice. Do not describe unconfigured OAuth, Resend, Storage, or Cron as working.
