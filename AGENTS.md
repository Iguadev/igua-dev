<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# IGUA.DEV project conventions

- Primary public language: Spanish (Argentina), natural voseo. Preserve accents and the tagline.
- Use App Router and strict TypeScript. Prefer Server Components. Keep browser interactivity in narrowly scoped components.
- Domain mutations live in `src/features/*/actions.ts`; shared infrastructure in `src/lib`.
- Never substitute sample people, events, partners, projects, testimonials or statistics into production. Preserve honest empty states and closed provider integrations.
- Every action must authenticate/authorize itself. Database RLS is an additional boundary. Do not infer roles from user_metadata or from client inputs.
- Keep elevated SQL implementation in `private`, with empty search_path, explicit grants and tested public invoker wrappers. Registration/cancellation must lock the event row before counting or changing seats.
- Changes to migrations must be tested by applying the actual SQL to PostgreSQL. New migrations must be created with `npx supabase migration new <name>` after checking installed CLI help.
- Never touch an unrelated hosted project. Local-only is the user's current instruction.
- Secrets belong in environment configuration, never tracked files or client code.
- For nontrivial changes run `npm run typecheck`, `npm test` and `npm run build`; run `npm run test:concurrency` when changing registration/locking logic.
- `npm run test:e2e` requires installed Playwright browsers and an unconfigured local preview. Read docs/VERIFICATION.md before describing coverage.
