# IGUA.DEV implementation plan

Audit: empty workspace, no app, conventions or infrastructure. The supplied brief ends at “Phase 2”. No existing source changed. Local-only confirmed; existing KindFi Supabase is unrelated and untouched.

1. Establish Next.js App Router, strict TypeScript and semantic design tokens. Build public editorial experience and all requested route families.
2. Implement SSR authentication, member onboarding, owner-scoped projects and staff administration.
3. Normalize PostgreSQL schema; enforce RLS and role protection. Serialize event registration and cancellation on event rows; promote waitlist in FIFO order. Queue transactional email in the same transaction.
4. Verify PostgreSQL permissions and registration behavior, validate forms and redirects, run production build and desktop/mobile browser journeys.
5. Document deployment, provider configuration and verification gaps; hand off source and local preview.

## Design plan

Palette follows brief: ink #0B1016; lime #B5F36B; paper #F4F7F8; panel #151D25; rule #34414B; muted #A7B2BF. Geist Sans carries editorial headline and UI; Geist Mono marks actual metadata.

Hero: asymmetrical two-column layout, left aligned large statement and compact CTAs; right a custom confluence/network illustration derived from river routes. No stock photos, invented activity, affiliation or metrics. Navigation and footer are quiet; the river drawing is the signature element. Program areas have distinct geometric marks and limited supplementary accents. Global ambition comes through the system map and copy, not fake global membership.

Review: the dark/lime palette is explicitly required. Avoid the generic card wall by using editorial section headers, open columns, a single outlined launch event panel and program rows. No decorative numbering or fake terminal.

## Research

- Municipalidad de Puerto Iguazú, https://www.iguazu.gob.ar/historia/ — Triple Frontier context.
- Visit Iguazú, https://visitiguazu.travel/informacion/sobre-iguazu/sobre-iguazu/ — regional location and river confluence.

These inform design only. No institution is represented as a partner. No demographic, economic or community-size claims are made. Technical references: current Next.js installation documentation; Supabase SSR client guidance and changelog checked 2026-11-06. CLI v3 breaking change noted; inspect CLI help for local commands.
