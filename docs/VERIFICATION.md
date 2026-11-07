# Verification record

Checked 2026-11-06. Local-only scope; no hosted project modified.

## Evidence

| Boundary                              | Result                 | Evidence                                                                                                                                                                    |
| ------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strict TypeScript                     | Passed                 | `npm run typecheck`, no errors                                                                                                                                              |
| Domain and PostgreSQL/RLS integration | Passed                 | 27 tests across two files                                                                                                                                                   |
| Actual concurrency                    | Passed                 | 24 native PostgreSQL sessions; five confirmed, 19 waitlisted; duplicate retries produced 24 registrations and 24 initial emails; cancellation race preserved five confirmed |
| Production compilation                | Passed                 | `npm run build`, Next.js 16.4.5 webpack, all route families generated                                                                                                       |
| Public HTTP responses                 | Passed                 | 16 routes/assets returned 200 with expected HTML where relevant                                                                                                             |
| Protected page responses              | Passed                 | 13 anonymous member/admin paths returned early 307 redirects to login                                                                                                       |
| Missing page views                    | Passed                 | Three routes showed intentional missing-page UI and noindex; Next.js may stream these as HTTP 200 after loading starts                                                      |
| Sensitive APIs                        | Passed                 | Unauthenticated email-job and attendee-export calls returned 401                                                                                                            |
| Desktop browser                       | Reviewed               | Homepage at 1440×1000, event launch state, join navigation; saved preview-desktop.png                                                                                       |
| Phone browser                         | Reviewed               | Homepage, join form, mobile navigation at 390×844; document/content width both 390 px; saved preview-mobile.png                                                             |
| Keyboard navigation                   | Passed                 | Enter opens menu, Escape closes it and restores focus to trigger                                                                                                            |
| Browser errors                        | None observed          | Browser tool returned no error-level console entries in inspected journeys                                                                                                  |
| OAuth / magic link                    | Not exercised live     | No IGUA.DEV Supabase provider configuration or credentials supplied                                                                                                         |
| Authenticated browser flows           | Not exercised live     | Database contracts tested separately; no real Supabase sessions                                                                                                             |
| Storage / Resend / Cron / Sentry      | Not exercised live     | Implemented and build-checked, providers unconfigured                                                                                                                       |
| Playwright runner                     | Authored, not run      | Desktop/mobile launch specs provided; browser QA used the supported browser tool                                                                                            |
| Full WCAG / Core Web Vitals           | Not certified/measured | Semantics, focus, reduced motion and responsiveness implemented; deployed-content audit still needed                                                                        |

## User stories traced

Public visitor → hero → event list → honest launch empty state → join → disabled provider actions with a clear notice. No fabricated registrations or emails.

Member → validated action → PostgreSQL function → owner/role validation and RLS → rendered feedback. PostgreSQL tests cover profile privacy, consent, role escalation denial, onboarding requirement, capacity, retries, FIFO promotion, cancellation, project ownership, moderation reset, draft visibility, venue visibility, deletion request and queue leasing. These establish database behavior, not a claim that OAuth or PostgREST were exercised against Supabase.

## Issues resolved during verification

- Switched production build to supported webpack after a Turbopack internal worker-port failure in the authoring environment. Development preview works with Turbopack.
- Updated Sentry integration for v11 config exports and granular data collection, with lazy browser loading.
- Fixed the outer venue ID reference in the public venue policy.
- Raised Server Action body limit to 3 MB for accepted 2 MB images; avatar preview bypasses image caching to preserve signed-URL privacy.
- Added direct-RPC member throttling, so sensitive write limits do not rely solely on Server Actions.
- Added optimistic early redirects in proxy; actual authorization remains in server guards and database policies.
- Corrected a test assumption about tied waitlist timestamps: FIFO follows the implemented `(created_at,id)` order rather than test input order.

## Scope still requiring work before a public launch

Follow docs/DEPLOYMENT.md for provider setup, advisors, authenticated browser journeys, operational ownership and real contact details. The schema includes collaborator membership, project covers, partner logos and event resource fields; their complete management UI is not part of this first local implementation. QR check-in is modeled by tokens but no scanner is advertised. Account deletion is a request plus documented administrator operation, not instant automation. The implementation should be reviewed as a substantial local first version, not an already-operating production service.

## Three.js enhancement — 2026-11-07

The approved hero now supports a progressively loaded Three.js scene. TypeScript, 27 regression tests and the production build passed. Browser checks covered desktop/mobile rendering, pause/resume via keyboard, offscreen suspension, route cleanup and absence of console errors. The original static SVG is still server-rendered. See docs/THREE-CONFLUENCE.md for design choices, performance boundaries and verification limitations.

## Resources section — 2026-11-07

Added `/recursos` and seven verified references, topic navigation, GET search, result counts and an intentional empty state. Search is insensitive to letter case and accents; category and query combine in the URL. Catalog entries live in `src/features/resources/catalog.ts` and require no connected services.

TypeScript, the existing 27 regression tests and production build passed. Local HTTP checks verified the seven-item list, category filtering, accented search, no results, combined filters and sitemap inclusion. Browser checks verified security filtering, keyboard search, resetting filters, mobile menu navigation and a 390 px phone viewport with no horizontal overflow. All seven external URLs were opened with the web tool; the Claude Code blog redirect is reflected in its current URL. No external forms, accounts, subscriptions or installations were submitted.


## English, SEO and GEO — 2026-11-07

33 tests pass, including locale routing, external URL preservation, reciprocal canonical/hreflang metadata, truthful organization data, English resource search and translation-key coverage. Strict TypeScript and the production webpack build pass. The HTTP check covers 11 English pages, spoofed locale-header rejection, English protected-route redirects, bilingual sitemap, robots, llms.txt and both localized social images. The original launch regression check also passes.

Browser verification covered switching both directions, preserving query filters, searching English resource categories and internal English navigation. English homepage was reviewed at desktop and 320 px width with equal document/content widths, and no error-level console entries were observed. Saved preview-english.png and preview-english-mobile.png. A stale development metadata route after file replacement was resolved by restarting the preview with a clean development cache.

Event/project text supplied by community authors remains in its original language; providers and authenticated sessions remain unconfigured. Search engine indexing and AI inclusion are not claimed.

## Community reglamento — 2026-11-07

Added `/reglamento` and `/en/reglamento`, with original wording informed by https://salta.dev/reglamento/ and attribution on the page. The reference was fetched directly after the web reader could not access it. Covers scope, respectful learning, prohibited conduct, privacy, channel announcements, reporting, moderation/review and updates. No third-party contact information was copied. Dedicated reporting is explicitly unavailable until a real channel and responsible team are configured.

Linked from Community, footer and registration; retained the existing community summary and its anchor for old links. Included in sitemap, language metadata, breadcrumbs and llms.txt. All 33 tests, TypeScript and production build pass. The HTTP suite now checks 12 English routes. Browser checks cover Spanish/English rendering, section links and preserved fragments when changing language, plus 390 px mobile layout without overflow. No console errors observed. Screenshots: preview-reglamento.png and preview-reglamento-mobile.png.
